import { StdSignDoc, StdSignature } from "@keplr-wallet/types";

// Transaction status
export enum DirectTxStatus {
  PENDING = "pending",
  SIGNING = "signing",
  BROADCASTING = "broadcasting",
  WAITING = "waiting",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
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

// Single transaction data
export interface DirectTx {
  readonly type: DirectTxType;
  status: DirectTxStatus; // mutable while executing
  readonly chainId: string;
  readonly txData: DirectTxData;

  // Transaction hash for completed tx
  txHash?: string;

  // Error message if failed
  error?: string;
}

export enum DirectTxsExecutionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface DirectTxsExecutionData {
  readonly id: string;
  status: DirectTxsExecutionStatus;

  // keyring vault id
  readonly vaultId: string;

  // transactions
  readonly txs: DirectTx[];
  currentTxIndex: number; // Current transaction being processed

  // swap history id after record swap history
  swapHistoryId?: string;
  // TODO: add more required fields for swap history data
  readonly swapHistoryData?: {
    readonly chainId: string;
  };

  readonly timestamp: number; // Timestamp when execution started
}

// Execution result
export interface DirectTxsExecutionResult {
  readonly id: string;
  readonly txs: {
    chainId: string;
    txHash?: string;
  }[];
  readonly swapHistoryId?: string;
  readonly error?: string;
}
