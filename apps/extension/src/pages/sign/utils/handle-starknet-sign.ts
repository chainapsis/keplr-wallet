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
  DeployAccountContractPayload,
  num,
  hash as starknetHash,
  shortString,
  constants,
  DeployAccountSignerDetails,
  CallData,
  encode,
  stark,
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
} from "@ledgerhq/hw-app-starknet";

export const connectAndDeployAccountTxWithLedger = async (
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
            `m/2645'/579218131'/1393043893'/1'/0'/0`,
            deployAccountFields
          )
        : await starknetApp.signDeployAccountV1(
            `m/2645'/579218131'/1393043893'/1'/0'/0`,
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
        const signature = stark.signatureToDecimalArray([
          encode.addHexPrefix(encode.buf2hex(r)),
          encode.addHexPrefix(encode.buf2hex(s)),
        ]);

        return {
          transaction,
          signature,
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

    if (e.message.includes("0x5515")) {
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
