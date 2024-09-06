import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { EthSignType } from "@keplr-wallet/types";
import Transport from "@ledgerhq/hw-transport";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { KeplrError } from "@keplr-wallet/router";
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from "./ledger-types";
import Eth from "@ledgerhq/hw-app-eth";
import { LedgerUtils } from "../../../utils";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import {
  domainHash,
  EIP712MessageValidator,
  messageHash,
} from "@keplr-wallet/background";
import { serialize, TransactionTypes } from "@ethersproject/transactions";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import {
  KeystoneKeys,
  KeystoneUR,
  encodeEthMessage,
  getEthDataTypeFromSignType,
  getPathFromPubKey,
} from "./keystone";
import KeystoneSDK, { UR, utils } from "@keystonehq/keystone-sdk";
import { EthermintChainIdHelper } from "@keplr-wallet/cosmos";

export interface LedgerOptions {
  useWebHID: boolean;
}

export interface KeystoneOptions {
  displayQRCode: (ur: { type: string; cbor: string }) => Promise<void>;
  scanQRCode: () => Promise<KeystoneUR>;
}

export const handleEthereumPreSignByLedger = async (
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>,
  signingMessage: Uint8Array,
  options?: LedgerOptions
): Promise<Uint8Array | undefined> => {
  const appData = interactionData.data.keyInsensitive;
  if (!appData) {
    throw new Error("Invalid ledger app data");
  }
  if (typeof appData !== "object") {
    throw new Error("Invalid ledger app data");
  }
  if (!appData["bip44Path"] || typeof appData["bip44Path"] !== "object") {
    throw new Error("Invalid ledger app data");
  }

  const bip44Path = appData["bip44Path"] as {
    account: number;
    change: number;
    addressIndex: number;
  };

  const publicKey = Buffer.from((appData["Ethereum"] as any)["pubKey"], "hex");
  if (publicKey.length === 0) {
    throw new Error("Invalid ledger app data");
  }

  return connectAndSignEthWithLedger(
    !!options?.useWebHID,
    publicKey,
    bip44Path,
    signingMessage,
    interactionData.data.signType
  );
};

export const handleEthereumPreSignByKeystone = async (
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>,
  signingMessage: Uint8Array,
  options: KeystoneOptions
): Promise<Uint8Array | undefined> => {
  const keystoneSDK = new KeystoneSDK({
    origin: "Keplr Extension",
  });
  const address = interactionData.data.signer;
  const path = getPathFromPubKey(
    interactionData.data.keyInsensitive["keys"] as KeystoneKeys,
    Buffer.from(interactionData.data.pubKey).toString("hex")
  );
  if (path === null) {
    throw new Error("Invalid signer");
  }
  const random = Buffer.alloc(16);
  Buffer.from(interactionData.id, "hex").copy(random);
  const requestId = utils.uuid.v4({
    random,
  });
  const signData = encodeEthMessage(
    signingMessage,
    interactionData.data.signType
  ).toString("hex");
  const evmChainId = (() => {
    try {
      return EthermintChainIdHelper.parse(interactionData.data.chainId)
        .ethChainId;
    } catch (e) {
      const chainIdLikeCAIP2 = interactionData.data.chainId.split(":");
      const evmChainId = parseInt(chainIdLikeCAIP2[1]);
      const isEVMOnlyChain =
        chainIdLikeCAIP2.length === 2 && chainIdLikeCAIP2[0] === "eip155";
      if (isEVMOnlyChain && !isNaN(evmChainId)) {
        return evmChainId;
      }

      throw e;
    }
  })();
  const ur = keystoneSDK.eth.generateSignRequest({
    requestId,
    signData,
    dataType: getEthDataTypeFromSignType(
      interactionData.data.signType,
      signingMessage
    ),
    path,
    xfp: interactionData.data.keyInsensitive["xfp"] as string,
    chainId: evmChainId,
    address,
  });
  await options.displayQRCode({
    type: ur.type,
    cbor: ur.cbor.toString("hex"),
  });
  const scanResult = await options.scanQRCode();
  const signResult = keystoneSDK.eth.parseSignature(
    new UR(Buffer.from(scanResult.cbor, "hex"), scanResult.type)
  );
  if (signResult.requestId !== requestId) {
    throw new Error("Invalid request id");
  }
  return Buffer.from(signResult.signature, "hex");
};

export const connectAndSignEthWithLedger = async (
  useWebHID: boolean,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  message: Uint8Array,
  signType: EthSignType
): Promise<Uint8Array> => {
  let transport: Transport;
  try {
    transport = useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  let ethApp = new Eth(transport);

  // Ensure that the keplr can connect to ethereum app on ledger.
  // getAppConfiguration() works even if the ledger is on screen saver mode.
  // To detect the screen saver mode, we should request the address before using.
  try {
    await ethApp.getAddress(`m/44'/60'/'0/0/0`);
  } catch (e) {
    // Device is locked
    if (e?.message.includes("(0x6b0c)")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else if (
      // User is in home sceen or other app.
      e?.message.includes("(0x6511)") ||
      e?.message.includes("(0x6e00)")
    ) {
      // Do nothing
    } else {
      await transport.close();

      throw e;
    }
  }

  transport = await LedgerUtils.tryAppOpen(transport, "Ethereum");
  ethApp = new Eth(transport);

  try {
    let pubKey: PubKeySecp256k1;
    try {
      const res = await ethApp.getAddress(
        `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
      );

      pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, "hex"));
    } catch (e) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedGetPublicKey,
        e.message || e.toString()
      );
    }

    if (
      Buffer.from(new PubKeySecp256k1(expectedPubKey).toBytes()).toString(
        "hex"
      ) !== Buffer.from(pubKey.toBytes()).toString("hex")
    ) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrPublicKeyUnmatched,
        "Public key unmatched"
      );
    }

    if (signType === EthSignType.EIP712) {
      // Pre validate the eip712 message to separate the error case.
      await EIP712MessageValidator.validateAsync(
        JSON.parse(Buffer.from(message).toString())
      );
    }

    try {
      switch (signType) {
        case EthSignType.MESSAGE: {
          return ethSignatureToBytes(
            await ethApp.signPersonalMessage(
              `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
              Buffer.from(message).toString("hex")
            )
          );
        }
        case EthSignType.TRANSACTION: {
          const tx = JSON.parse(Buffer.from(message).toString());
          const isEIP1559 = !!tx.maxFeePerGas || !!tx.maxPriorityFeePerGas;
          if (isEIP1559) {
            tx.type = TransactionTypes.eip1559;
          }
          const rlpArray = serialize(tx).replace("0x", "");
          const signature = await ethApp.signTransaction(
            `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
            rlpArray
          );

          const numberSignatureV = parseInt(signature.v, 16);
          return ethSignatureToBytes({
            ...signature,
            v:
              numberSignatureV === 0
                ? "1b"
                : numberSignatureV === 1 || numberSignatureV % 2 === 0
                ? "1c"
                : "1b",
          });
        }
        case EthSignType.EIP712: {
          const data = await EIP712MessageValidator.validateAsync(
            JSON.parse(Buffer.from(message).toString())
          );

          // Unfortunately, signEIP712Message not works on ledger yet.
          return ethSignatureToBytes(
            await ethApp.signEIP712HashedMessage(
              `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
              domainHash(data),
              messageHash(data)
            )
          );
        }
        default:
          throw new Error("Invalid sign type");
      }
    } catch (e) {
      if (e?.message.includes("(0x6985)")) {
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      }

      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedSign,
        e.message || e.toString()
      );
    }
  } finally {
    await transport.close();
  }
};

function ethSignatureToBytes(signature: {
  v: number | string;
  r: string;
  s: string;
}): Uint8Array {
  // Validate signature.r is hex encoded
  const r = Buffer.from(signature.r, "hex");
  // Validate signature.s is hex encoded
  const s = Buffer.from(signature.s, "hex");

  // Must be 32 bytes
  if (r.length !== 32 || s.length !== 32) {
    throw new Error("Unable to process signature: malformed fields");
  }

  const v =
    typeof signature.v === "string" ? parseInt(signature.v, 16) : signature.v;

  if (!Number.isInteger(v)) {
    throw new Error("Unable to process signature: malformed fields");
  }

  return Buffer.concat([r, s, Buffer.from([v])]);
}
