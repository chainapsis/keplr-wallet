import { EthSignType, EthTransactionType } from "@keplr-wallet/types";
import { KeystoneEthereumSDK } from "@keystonehq/keystone-sdk";
import { Transaction, TransactionLike } from "ethers";

export interface KeystoneUR {
  type: string;
  cbor: string;
}

export interface KeystoneKeys {
  [path: string]: {
    chain: string;
    name: string;
    pubKey: string;
  };
}

export function getPathFromPubKey(
  keys: KeystoneKeys,
  pubKey: string
): string | null {
  for (const path in keys) {
    if (Object.prototype.hasOwnProperty.call(keys, path)) {
      const key = keys[path];
      if (key.pubKey === pubKey) {
        return path;
      }
    }
  }
  return null;
}

export function getEthDataTypeFromSignType(
  signType: EthSignType,
  message?: Uint8Array
) {
  switch (signType) {
    case EthSignType.TRANSACTION:
      if (message) {
        const txLike: TransactionLike = JSON.parse(
          Buffer.from(message).toString()
        );
        if (txLike.from) {
          delete txLike.from;
        }

        const tx = Transaction.from(txLike);

        const isEIP1559 = !!tx.maxFeePerGas || !!tx.maxPriorityFeePerGas;
        if (isEIP1559) {
          tx.type = EthTransactionType.eip1559;
        }
        if (!tx.type) {
          return KeystoneEthereumSDK.DataType.transaction;
        }
        return KeystoneEthereumSDK.DataType.typedTransaction;
      }
      return KeystoneEthereumSDK.DataType.transaction;
    case EthSignType.MESSAGE:
      return KeystoneEthereumSDK.DataType.personalMessage;
    case EthSignType.EIP712:
      return KeystoneEthereumSDK.DataType.typedData;
  }
}

export function encodeEthMessage(
  message: Uint8Array,
  signType: EthSignType
): Buffer {
  switch (signType) {
    case EthSignType.TRANSACTION:
      const txLike: TransactionLike = JSON.parse(
        Buffer.from(message).toString()
      );
      if (txLike.from) {
        delete txLike.from;
      }

      const tx = Transaction.from(txLike);
      const isEIP1559 = !!tx.maxFeePerGas || !!tx.maxPriorityFeePerGas;
      if (isEIP1559) {
        tx.type = EthTransactionType.eip1559;
      }

      return Buffer.from(tx.serialized.replace(/^0x/, ""), "hex");
    case EthSignType.MESSAGE:
    case EthSignType.EIP712:
      return Buffer.from(message);
  }
}

export const ErrModuleKeystoneSign = "keystone-sign";
export const ErrInvalidSigner = 1;
export const ErrInvalidRequestId = 2;
export const ErrInvalidPublicKey = 3;
export const ErrInvalidSignature = 4;
export const ErrKeystoneUSBCommunication = 5;
