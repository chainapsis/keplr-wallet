import { UnsignedTransaction } from "@ethersproject/transactions";
import { StdSignDoc } from "@keplr-wallet/types";

// Transaction status
export enum BackgroundTxStatus {
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
export enum BackgroundTxType {
  EVM = "evm",
  COSMOS = "cosmos",
}

// Base transaction interface
interface BackgroundTxBase {
  status: BackgroundTxStatus; // mutable while executing
  readonly chainId: string;

  // signed transaction data
  signedTx?: Uint8Array;

  // Transaction hash for completed tx
  txHash?: string;

  // Error message if failed
  error?: string;
}

export interface EVMBackgroundTx extends BackgroundTxBase {
  readonly type: BackgroundTxType.EVM;
  readonly txData: UnsignedTransaction;
}

export interface CosmosBackgroundTx extends BackgroundTxBase {
  readonly type: BackgroundTxType.COSMOS;
  readonly txData: StdSignDoc;
}

// Single transaction data with discriminated union based on type
export type BackgroundTx = EVMBackgroundTx | CosmosBackgroundTx;

export enum TxExecutionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  BLOCKED = "blocked",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum TxExecutionType {
  UNDEFINED = "undefined",
  IBC_TRANSFER = "ibc-transfer",
  SWAP_V2 = "swap-v2",
}

export interface TxExecutionBase {
  readonly id: string;
  status: TxExecutionStatus;

  // keyring vault id
  readonly vaultId: string;

  // transactions
  readonly txs: BackgroundTx[];
  txIndex: number; // Current transaction being processed

  executableChainIds: string[]; // executable chain ids

  readonly timestamp: number; // Timestamp when execution started
}

export interface UndefinedTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.UNDEFINED;
}

export interface IBCTransferTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.IBC_TRANSFER;
  readonly ibcHistoryId?: string;
  // TODO: add more required fields for ibc history data
  readonly ibcHistoryData: {
    readonly chainId: string;
  };
}

export interface SwapV2TxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.SWAP_V2;
  readonly swapHistoryId?: string;
  // TODO: add more required fields for swap history data
  readonly swapHistoryData: {
    readonly chainId: string;
  };
}

export type TxExecution =
  | UndefinedTxExecution
  | SwapV2TxExecution
  | IBCTransferTxExecution;
