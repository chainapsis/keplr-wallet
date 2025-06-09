import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
  LedgerOptions,
} from "./ledger-types";
import {
  Call,
  DeployAccountContractPayload,
  num,
  hash as starknetHash,
  shortString,
  constants,
  encode,
  TypedData,
  V3InvocationsSignerDetails,
  LedgerSigner231,
  getLedgerPathBuffer221,
  V3DeployAccountSignerDetails,
  stark,
  hash,
  CallData,
} from "starknet";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { KeplrError } from "@keplr-wallet/router";
import {
  LedgerError,
  ResponseHashSign,
  ResponsePublicKey,
  ResponseTxSign,
  StarknetClient,
} from "@ledgerhq/hw-app-starknet";
import { PubKeyStarknet } from "@keplr-wallet/crypto";
import { Fee } from "@keplr-wallet/stores-starknet/build/account/internal";

// eip-2645 derivation path, m/2645'/starknet'/{application}'/0'/{accountId}'/0
export const STARKNET_LEDGER_DERIVATION_PATH =
  "m/2645'/1195502025'/1148870696'/0'/0'/0";

// Custom path buffer function that overrides path2buff
function getCustomLedgerPathBuffer(accountId: number): Uint8Array {
  // Get the original path buffer from starknet library
  const originalPathBuff = getLedgerPathBuffer221(accountId);

  // Create custom path2buff to replace the original one
  const HARDENING_BYTE = 128;
  const customApplicationId = 1148870696; // 4bytes of the hash of applicationName

  const path2Base = Buffer.alloc(4);
  path2Base.writeUInt32BE(customApplicationId, 0); // Should be BigEndian

  const customPath2buff = encode.concatenateArrayBuffer([
    new Uint8Array([path2Base[0] | HARDENING_BYTE]),
    path2Base.subarray(1),
  ]);

  // Create a copy of the original buffer to modify
  const modifiedPathBuff = new Uint8Array(originalPathBuff);

  // Replace path2buff in the buffer
  // The original getLedgerPathBuffer221 creates a buffer with this structure:
  // path0buff(4) + path1buff(4) + path2buff(4) + path3buff(4) + path4buff(4) + path5buff(4) = 24 bytes total
  // path2buff starts at byte index 8 (0-based) and is 4 bytes long
  if (modifiedPathBuff.length >= 12 && customPath2buff.length === 4) {
    modifiedPathBuff.set(customPath2buff, 8); // Replace bytes 8-11 with custom path2buff
  } else {
    throw new Error("Invalid path buffer structure for path2buff override");
  }

  return modifiedPathBuff;
}

export const connectAndSignDeployAccountTxWithLedger = async (
  chainId: string,
  expectedPubKey: Uint8Array,
  {
    classHash,
    constructorCalldata = [],
    addressSalt = 0,
    contractAddress: providedContractAddress,
  }: DeployAccountContractPayload,
  fee: Fee,
  options: LedgerOptions = { useWebHID: true }
): Promise<{
  transaction: V3DeployAccountSignerDetails;
  signature: string[];
}> => {
  await checkStarknetPubKey(expectedPubKey, options);

  let transport: Transport;
  try {
    transport = options.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    console.error(e);
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  const nonce = 0; // DEPLOY_ACCOUNT transaction will have a nonce zero as it is the first transaction in the account
  const contractAddress =
    providedContractAddress ??
    starknetHash.calculateContractAddressFromHash(
      addressSalt,
      classHash,
      constructorCalldata,
      0
    );

  const starknetChainId = shortString.encodeShortString(
    chainId.replace("starknet:", "")
  ) as constants.StarknetChainId;

  const transaction: V3DeployAccountSignerDetails = {
    version: "0x3",
    chainId: starknetChainId,
    contractAddress,
    nonce,
    classHash,
    constructorCalldata,
    addressSalt,
    resourceBounds: {
      l1_gas: {
        max_amount: num.toHex(fee.l1MaxGas),
        max_price_per_unit: num.toHex(fee.l1MaxGasPrice),
      },
      l2_gas: {
        max_amount: num.toHex(fee.l2MaxGas ?? "0"),
        max_price_per_unit: num.toHex(fee.l2MaxGasPrice ?? "0"),
      },
      l1_data_gas: {
        max_amount: num.toHex(fee.l1MaxDataGas),
        max_price_per_unit: num.toHex(fee.l1MaxDataGasPrice),
      },
    },
    tip: "0x0",
    paymasterData: [],
    accountDeploymentData: [],
    nonceDataAvailabilityMode: "L1",
    feeDataAvailabilityMode: "L1",
  };

  try {
    const ledgerSigner = new LedgerSigner231(
      transport,
      0,
      undefined,
      (accountId) => {
        return getCustomLedgerPathBuffer(accountId);
      }
    );

    // TODO: ledger and starknet.js msg hash mismatch error

    // const res = await ledgerSigner.signDeployAccountTransaction(transaction);

    const res = await ledgerSigner.signDeployAccountV3(transaction);

    console.log("ledger hash:", `0x${res.hash.toString(16)}`);

    const compiledConstructorCalldata = CallData.compile(constructorCalldata);

    const msgHash = hash.calculateDeployAccountTransactionHash({
      ...transaction,
      salt: transaction.addressSalt,
      compiledConstructorCalldata,
      version: transaction.version,
      nonceDataAvailabilityMode: stark.intDAM(
        transaction.nonceDataAvailabilityMode
      ),
      feeDataAvailabilityMode: stark.intDAM(
        transaction.feeDataAvailabilityMode
      ),
    });

    console.log("expected hash:", msgHash);

    if (Array.isArray(res.signature)) {
      // CHECK: recovery bit might be included in the result array
      return {
        transaction,
        signature: res.signature,
      };
    }

    const { r, s } = res.signature;

    return {
      transaction,
      signature: formatStarknetSignature({ r, s }),
    };
  } catch (e) {
    if (e.message?.includes("0x5515")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else {
      throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
    }
  } finally {
    await transport.close();
  }
};

export const connectAndSignInvokeTxWithLedger = async (
  expectedPubKey: Uint8Array,
  transactions: Call[],
  details: V3InvocationsSignerDetails,
  options: LedgerOptions = { useWebHID: true }
): Promise<string[]> => {
  await checkStarknetPubKey(expectedPubKey, options);

  let transport: Transport;
  try {
    transport = options?.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    console.error(e);
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  try {
    // EIP2645 path = 2645'/starknet/application/0/accountId/0
    const ledgerSigner = new LedgerSigner231(
      transport,
      0, // accountId
      undefined, // applicationName
      (accountId) => {
        return getCustomLedgerPathBuffer(accountId);
      }
    );

    const res = await ledgerSigner.signTransaction(transactions, details);

    if (Array.isArray(res)) {
      // CHECK: recovery bit might be included in the result array
      return res;
    }

    const { r, s } = res;
    return formatStarknetSignature({ r, s });
  } catch (e) {
    if (e.message?.includes("0x5515")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else {
      throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
    }
  } finally {
    await transport.close();
  }
};

export const connectAndSignMessageWithLedger = async (
  expectedPubKey: Uint8Array,
  message: TypedData,
  signer: string,
  options: LedgerOptions = { useWebHID: true }
): Promise<string[]> => {
  await checkStarknetPubKey(expectedPubKey, options);

  let transport: Transport;
  try {
    transport = options?.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    console.error(e);
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  try {
    const starknetApp = new StarknetClient(transport);
    const res = await starknetApp.signMessage(
      STARKNET_LEDGER_DERIVATION_PATH,
      message,
      signer
    );

    return handleLedgerResponse(res, () => {
      const { r, s } = res;
      return formatStarknetSignature({ r, s });
    });
  } catch (e) {
    if (e.message?.includes("0x5515")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else {
      throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
    }
  } finally {
    await transport.close();
  }
};

const formatStarknetSignature = ({
  r,
  s,
}: {
  r: Uint8Array | bigint;
  s: Uint8Array | bigint;
}): string[] => {
  return [
    typeof r === "bigint"
      ? encode.addHexPrefix(r.toString(16))
      : encode.addHexPrefix(encode.buf2hex(r)),
    typeof s === "bigint"
      ? encode.addHexPrefix(s.toString(16))
      : encode.addHexPrefix(encode.buf2hex(s)),
  ];
};

function handleLedgerResponse<R>(
  res: ResponsePublicKey | ResponseHashSign | ResponseTxSign,
  onNoError: () => R
): R {
  switch (res.returnCode) {
    case LedgerError.BadCla:
    case LedgerError.BadIns:
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedGetPublicKey,
        "Failed to get public key"
      );
    case LedgerError.UserRejected:
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrSignRejected,
        "User rejected signing"
      );
    case LedgerError.NoError:
      return onNoError();
    default:
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedSign,
        res.errorMessage ?? "Failed to sign"
      );
  }
}

async function checkStarknetPubKey(
  expectedPubKey: Uint8Array,
  options: LedgerOptions = { useWebHID: true }
) {
  let transport: Transport;
  try {
    transport = options?.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  try {
    const starknetApp = new StarknetClient(transport);

    const res = await starknetApp.getPubKey(
      STARKNET_LEDGER_DERIVATION_PATH,
      false
    );

    return handleLedgerResponse(res, () => {
      const { publicKey } = res;

      if (
        Buffer.from(new PubKeyStarknet(expectedPubKey).toBytes()).toString(
          "hex"
        ) !==
        Buffer.from(new PubKeyStarknet(publicKey).toBytes()).toString("hex")
      ) {
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrPublicKeyUnmatched,
          "Public key unmatched"
        );
      } else {
        return publicKey;
      }
    });
  } catch (e) {
    if (e.message?.includes("0x5515")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else {
      throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
    }
  } finally {
    await transport.close();
  }
}
