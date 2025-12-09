import { UnsignedTransaction } from "@ethersproject/transactions";
import { StdFee } from "@keplr-wallet/types";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { Msg } from "@keplr-wallet/types";
import {
  IBCTransferHistoryData,
  IBCSwapHistoryData,
  SwapV2HistoryData,
} from "../recent-send-history";

export {
  SwapProvider,
  IBCTransferHistoryData,
  IBCSwapHistoryData,
  SwapV2HistoryData,
  HistoryData,
} from "../recent-send-history";

// Transaction status
export enum BackgroundTxStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
  BLOCKED = "blocked",
}

// Transaction type
export enum BackgroundTxType {
  EVM = "evm",
  COSMOS = "cosmos",
}

// Base transaction interface
interface BackgroundTxBase {
  readonly chainId: string;

  status: BackgroundTxStatus;
  feeType?: BackgroundTxFeeType;
  feeCurrencyDenom?: string;

  // Cosmos: base64 encoded, EVM: hex encoded (0x prefix)
  signedTx?: string;

  // Transaction hash for completed tx
  txHash?: string;

  // Error message if failed
  error?: string;
}

export interface EVMBackgroundTx extends BackgroundTxBase {
  readonly type: BackgroundTxType.EVM;
  txData: UnsignedTransaction;
}

export interface CosmosBackgroundTx extends BackgroundTxBase {
  readonly type: BackgroundTxType.COSMOS;
  txData: {
    aminoMsgs?: Msg[];
    protoMsgs: Any[];

    // Add rlp types data if you need to support ethermint with ledger.
    // Must include `MsgValue`.
    rlpTypes?: Record<
      string,
      Array<{
        name: string;
        type: string;
      }>
    >;

    fee?: StdFee;
    memo?: string;
  };
}

// Single transaction data with discriminated union based on type
export type BackgroundTx = EVMBackgroundTx | CosmosBackgroundTx;

export enum TxExecutionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  BLOCKED = "blocked",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum TxExecutionType {
  UNDEFINED = "undefined",
  IBC_TRANSFER = "ibc-transfer",
  IBC_SWAP = "ibc-swap",
  SWAP_V2 = "swap-v2",
}

export type BackgroundTxFeeType = "low" | "average" | "high";

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

  // If true, automatic signing is prevented and this execution may be blocked.
  // This happens when:
  // 1. Some txs are not immediately executable (chainId not in executableChainIds)
  // 2. Hardware wallet (ledger/keystone) - requires user interaction for signing
  // When preventAutoSign is true, the execution will be persisted to KVStore.
  readonly preventAutoSign: boolean;

  readonly historyTxIndex?: number;
}

export interface UndefinedTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.UNDEFINED;
  historyData?: never;
}

export interface IBCTransferTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.IBC_TRANSFER;
  historyData?: IBCTransferHistoryData;

  historyId?: string;
}

export interface IBCSwapTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.IBC_SWAP;
  historyData?: IBCSwapHistoryData;

  historyId?: string;
}

export interface SwapV2TxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.SWAP_V2;
  historyData?: SwapV2HistoryData;

  historyId?: string;
}

export type ExecutionTypeToHistoryData = {
  [TxExecutionType.SWAP_V2]: SwapV2HistoryData;
  [TxExecutionType.IBC_TRANSFER]: IBCTransferHistoryData;
  [TxExecutionType.IBC_SWAP]: IBCSwapHistoryData;
  [TxExecutionType.UNDEFINED]: undefined;
};

export type TxExecution =
  | UndefinedTxExecution
  | IBCTransferTxExecution
  | IBCSwapTxExecution
  | SwapV2TxExecution;

/**
 * Result of executing a single pending transaction.
 * Used to batch state updates and reduce autorun triggers.
 */
export interface PendingTxExecutionResult {
  status: BackgroundTxStatus;
  txHash?: string;
  error?: string;
}

/**
 * Result of executing a single transaction.
 * Used to batch state updates and reduce autorun triggers.
 */
export interface TxExecutionResult {
  status: TxExecutionStatus;
  error?: string;
}
