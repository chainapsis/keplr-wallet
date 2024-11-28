import {
  ErrCodeDeviceLocked,
  ErrCodeUnsupportedApp,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrSignRejected,
  LedgerOptions,
} from "./ledger-types";
import {
  Call,
  DeployAccountContractPayload,
  InvocationsSignerDetails,
  num,
  hash as starknetHash,
  shortString,
  constants,
  DeployAccountSignerDetails,
  CallData,
  encode,
  TypedData,
} from "starknet";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { KeplrError } from "@keplr-wallet/router";
import {
  DeployAccountFields,
  DeployAccountV1Fields,
  LedgerError,
  StarknetClient,
  TxFields,
  TxV1Fields,
} from "@ledgerhq/hw-app-starknet";

export const STARKNET_LEDGER_DERIVATION_PATH =
  "m/2645'/1195502025'/1148870696'/0'/0'/0";

export const connectAndSignDeployAccountTxWithLedger = async (
  chainId: string,
  {
    classHash,
    constructorCalldata = [],
    addressSalt = 0,
    contractAddress: providedContractAddress,
  }: DeployAccountContractPayload,
  fee:
    | {
        type: "ETH";
        maxFee: string;
      }
    | {
        type: "STRK";
        gas: string;
        maxGasPrice: string;
      },
  options: LedgerOptions = { useWebHID: true }
): Promise<{
  transaction: DeployAccountSignerDetails;
  signature: string[];
}> => {
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
  const compiledConstructorCalldata = CallData.compile(constructorCalldata);
  const starknetChainId = shortString.encodeShortString(
    chainId.replace("starknet:", "")
  ) as constants.StarknetChainId;

  const deployAccountFields: DeployAccountFields | DeployAccountV1Fields =
    (() => {
      switch (fee.type) {
        case "ETH":
          // V1
          return {
            class_hash: classHash,
            constructor_calldata: compiledConstructorCalldata,
            contractAddress,
            contract_address_salt: addressSalt,
            nonce: nonce,
            chainId: starknetChainId,
            max_fee: num.toHex(fee.maxFee),
          } as DeployAccountV1Fields;
        // V3
        case "STRK":
          return {
            class_hash: classHash,
            constructor_calldata: compiledConstructorCalldata,
            contractAddress,
            contract_address_salt: addressSalt,
            nonce: nonce,
            chainId: starknetChainId,
            resourceBounds: {
              l1_gas: {
                max_amount: num.toHex(fee.gas),
                max_price_per_unit: num.toHex(fee.maxGasPrice),
              },
              l2_gas: {
                max_amount: "0x0",
                max_price_per_unit: "0x0",
              },
            },
            tip: "0x0",
            paymaster_data: [],
            nonceDataAvailabilityMode: "L1",
            feeDataAvailabilityMode: "L1",
          } as DeployAccountFields;
        default:
          throw new Error("Invalid fee type");
      }
    })();

  try {
    const starknetApp = new StarknetClient(transport);
    const res =
      "resourceBounds" in deployAccountFields
        ? await starknetApp.signDeployAccount(
            STARKNET_LEDGER_DERIVATION_PATH,
            deployAccountFields
          )
        : await starknetApp.signDeployAccountV1(
            STARKNET_LEDGER_DERIVATION_PATH,
            deployAccountFields
          );

    switch (res.returnCode) {
      case LedgerError.BadCla:
      case LedgerError.BadIns:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrCodeUnsupportedApp,
          "Unsupported app"
        );
      case LedgerError.UserRejected:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      case LedgerError.NoError:
        const { r, s } = res;

        const transaction: DeployAccountSignerDetails = (() => {
          switch (fee.type) {
            case "ETH":
              return {
                classHash,
                constructorCalldata: compiledConstructorCalldata,
                contractAddress,
                addressSalt,
                version: "0x1",
                nonce: nonce,
                chainId: starknetChainId,
                maxFee: num.toHex(fee.maxFee),
                resourceBounds: {
                  l1_gas: {
                    max_amount: "0x0",
                    max_price_per_unit: "0x0",
                  },
                  l2_gas: {
                    max_amount: "0x0",
                    max_price_per_unit: "0x0",
                  },
                },
                tip: "0x0",
                paymasterData: [],
                accountDeploymentData: [],
                nonceDataAvailabilityMode: "L1",
                feeDataAvailabilityMode: "L1",
              };
            case "STRK":
              return {
                classHash,
                constructorCalldata: compiledConstructorCalldata,
                contractAddress,
                addressSalt,
                version: "0x3",
                nonce: nonce,
                chainId: starknetChainId,
                resourceBounds: {
                  l1_gas: {
                    max_amount: num.toHex(fee.gas),
                    max_price_per_unit: num.toHex(fee.maxGasPrice),
                  },
                  l2_gas: {
                    max_amount: "0x0",
                    max_price_per_unit: "0x0",
                  },
                },
                tip: "0x0",
                paymasterData: [],
                accountDeploymentData: [],
                nonceDataAvailabilityMode: "L1",
                feeDataAvailabilityMode: "L1",
              };
            default:
              throw new Error("Invalid fee type");
          }
        })();

        return {
          transaction,
          signature: formatStarknetSignature({ r, s }),
        };
      default:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrFailedSign,
          res.errorMessage ?? "Failed to sign"
        );
    }
  } catch (e) {
    await transport.close();

    if (e.message?.includes("0x5515")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else {
      throw e;
    }
  } finally {
    await transport.close();
  }
};

export const connectAndSignInvokeTxWithLedger = async (
  transactions: Call[],
  details: InvocationsSignerDetails,
  options: LedgerOptions = { useWebHID: true }
): Promise<string[]> => {
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

  const txFields: TxFields | TxV1Fields = (() => {
    switch (details.version) {
      case "0x1":
        return {
          accountAddress: details.walletAddress,
          chainId: details.chainId,
          nonce: details.nonce,
          max_fee: details.maxFee,
        };
      case "0x3":
        return {
          accountAddress: details.walletAddress,
          chainId: details.chainId,
          nonce: details.nonce,
          tip: details.tip,
          resourceBounds: details.resourceBounds,
          paymaster_data: details.paymasterData,
          nonceDataAvailabilityMode: details.nonceDataAvailabilityMode,
          feeDataAvailabilityMode: details.feeDataAvailabilityMode,
          account_deployment_data: details.accountDeploymentData,
        };
      default:
        throw new Error("Invalid version");
    }
  })();

  try {
    const starknetApp = new StarknetClient(transport);
    const res =
      "resourceBounds" in txFields
        ? await starknetApp.signTx(
            STARKNET_LEDGER_DERIVATION_PATH,
            transactions,
            txFields
          )
        : await starknetApp.signTxV1(
            STARKNET_LEDGER_DERIVATION_PATH,
            transactions,
            txFields
          );

    switch (res.returnCode) {
      case LedgerError.BadCla:
      case LedgerError.BadIns:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrCodeUnsupportedApp,
          "Unsupported app"
        );
      case LedgerError.UserRejected:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      case LedgerError.NoError:
        const { r, s } = res;

        return formatStarknetSignature({ r, s });
      default:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrFailedSign,
          res.errorMessage ?? "Failed to sign"
        );
    }
  } catch (e) {
    await transport.close();

    if (e.message?.includes("0x5515")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else {
      throw e;
    }
  } finally {
    await transport.close();
  }
};

export const connectAndSignMessageWithLedger = async (
  message: TypedData,
  signer: string,
  options: LedgerOptions = { useWebHID: true }
): Promise<string[]> => {
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
    const res = await starknetApp.signMessage(
      STARKNET_LEDGER_DERIVATION_PATH,
      message,
      signer
    );

    switch (res.returnCode) {
      case LedgerError.BadCla:
      case LedgerError.BadIns:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrCodeUnsupportedApp,
          "Unsupported app"
        );
      case LedgerError.UserRejected:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      case LedgerError.NoError:
        const { r, s } = res;

        return formatStarknetSignature({ r, s });
      default:
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrFailedSign,
          res.errorMessage ?? "Failed to sign"
        );
    }
  } catch (e) {
    await transport.close();

    if (e.message?.includes("0x5515")) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else {
      throw e;
    }
  } finally {
    await transport.close();
  }
};

const formatStarknetSignature = ({
  r,
  s,
}: {
  r: Uint8Array;
  s: Uint8Array;
}): string[] => {
  return [
    encode.addHexPrefix(encode.buf2hex(r)),
    encode.addHexPrefix(encode.buf2hex(s)),
  ];
};
