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
  CallData,
  DeployAccountContractPayload,
  num,
  hash as starknetHash,
  shortString,
  constants,
  DeployAccountSignerDetails,
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
import { LedgerUtils } from "../../../utils";

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
  const nonce = 0; // DEPLOY_ACCOUNT transaction will have a nonce zero as it is the first transaction in the account

  const compiledCalldata = CallData.compile(constructorCalldata);
  const contractAddress =
    providedContractAddress ??
    starknetHash.calculateContractAddressFromHash(
      addressSalt,
      classHash,
      compiledCalldata,
      0
    );
  const starknetChainId = shortString.encodeShortString(
    chainId
  ) as constants.StarknetChainId;

  const deployAccountFields: DeployAccountFields | DeployAccountV1Fields =
    (() => {
      switch (fee.type) {
        case "ETH":
          // V1
          return {
            class_hash: classHash,
            constructor_calldata: compiledCalldata,
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
            constructor_calldata: compiledCalldata,
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

  let transport: Transport;
  try {
    transport = options.useWebHID
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
    transport = await LedgerUtils.tryAppOpen(transport, "Starknet");
    const starknetApp = new StarknetClient(transport);
    const res =
      "tip" in deployAccountFields
        ? await starknetApp.signDeployAccount(
            `m/2645'/579218131'/1393043893'/0'/0'/0`,
            deployAccountFields
          )
        : await starknetApp.signDeployAccountV1(
            `m/2645'/579218131'/1393043893'/0'/0'/0`,
            deployAccountFields
          );

    console.log("res", res);
    console.log("contractAddress", contractAddress);

    switch (res.returnCode) {
      case LedgerError.BadCla:
      case LedgerError.BadIns:
        await transport.close();

        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrCodeUnsupportedApp,
          "Unsupported app"
        );
      case LedgerError.UserRejected:
        await transport.close();

        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      case LedgerError.NoError:
        const { h, errorMessage, returnCode, ...signature } = res;

        const signerDetails: DeployAccountSignerDetails = (() => {
          switch (fee.type) {
            case "ETH":
              return {
                classHash,
                constructorCalldata: compiledCalldata,
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
                constructorCalldata: compiledCalldata,
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
          transaction: signerDetails,
          signature: starknetSignatureToBytes(signature),
        };

      default:
        await transport.close();

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
  }
};

export const starknetSignatureToBytes = (signature: {
  r: Uint8Array;
  s: Uint8Array;
  v: number;
}): string[] => {
  return [
    "0x1",
    "0x" + Buffer.from(signature.r).toString("hex"),
    "0x" + Buffer.from(signature.s).toString("hex"),
  ];
};
