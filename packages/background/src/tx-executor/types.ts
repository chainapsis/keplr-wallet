import { StdSignDoc, StdSignature } from "@keplr-wallet/types";

// Transaction status
export enum DirectTxStatus {
  PENDING = "pending",
  SIGNING = "signing",
  SIGNED = "signed",
  BROADCASTING = "broadcasting",
  BROADCASTED = "broadcasted",
  CONFIRMED = "confirmed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  BLOCKED = "blocked",
}

// Transaction type
export enum DirectTxType {
  EVM = "evm",
  COSMOS = "cosmos",
}

// TODO: 뭐가 필요할까...
export interface CosmosTxData {
  readonly signDoc: StdSignDoc;
  readonly signature?: StdSignature;
}

export interface EvmTxData {
  readonly tx: Uint8Array;
  readonly signature?: Uint8Array;
}

// Transaction data union type
export type DirectTxData =
  | EvmTxData // EVM transaction data
  | CosmosTxData; // Cosmos transaction construction data

// Base transaction interface
interface DirectTxBase {
  status: DirectTxStatus; // mutable while executing
  readonly chainId: string;

  // signed transaction data
  signedTx?: Uint8Array;
  signature?: Uint8Array;

  // Transaction hash for completed tx
  txHash?: string;

  // Error message if failed
  error?: string;
}

export interface EVMDirectTx extends DirectTxBase {
  readonly type: DirectTxType.EVM;
  readonly txData: EvmTxData;
}

export interface CosmosDirectTx extends DirectTxBase {
  readonly type: DirectTxType.COSMOS;
  readonly txData: CosmosTxData;
}

// Single transaction data with discriminated union based on type
export type DirectTx = EVMDirectTx | CosmosDirectTx;

export enum DirectTxBatchStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  BLOCKED = "blocked",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum DirectTxBatchType {
  UNDEFINED = "undefined",
  IBC_TRANSFER = "ibc-transfer",
  SWAP_V2 = "swap-v2",
}

export interface DirectTxBatchBase {
  readonly id: string;
  status: DirectTxBatchStatus;

  // keyring vault id
  readonly vaultId: string;

  // transactions
  readonly txs: DirectTx[];
  txIndex: number; // Current transaction being processed

  executableChainIds: string[]; // executable chain ids

  readonly timestamp: number; // Timestamp when execution started
}

export type DirectTxBatch =
  | (DirectTxBatchBase & {
      readonly type: DirectTxBatchType.UNDEFINED;
    })
  | (DirectTxBatchBase & {
      readonly type: DirectTxBatchType.SWAP_V2;
      swapHistoryId?: string;
      // TODO: add more required fields for swap history data
      readonly swapHistoryData: {
        readonly chainId: string;
      };
    })
  | (DirectTxBatchBase & {
      readonly type: DirectTxBatchType.IBC_TRANSFER;
      readonly ibcHistoryId?: string;
      // TODO: add more required fields for ibc history data
      readonly ibcHistoryData: {
        readonly chainId: string;
      };
    });
