import { UnsignedTransaction } from "@ethersproject/transactions";
import { AppCurrency, StdSignDoc } from "@keplr-wallet/types";
import { SwapProvider } from "../recent-send-history";

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
  SEND = "send",
  IBC_TRANSFER = "ibc-transfer",
  IBC_SWAP = "ibc-swap",
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

export interface RecentSendHistoryData {
  readonly chainId: string;
  readonly historyType: string;
  readonly sender: string;
  readonly recipient: string;
  readonly amount: {
    readonly amount: string;
    readonly denom: string;
  }[];
  readonly memo: string;
  ibcChannels:
    | {
        portId: string;
        channelId: string;
        counterpartyChainId: string;
      }[]
    | undefined;
}

export interface SendTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.SEND;

  hasRecordedHistory?: boolean;
  readonly sendHistoryData?: RecentSendHistoryData;
}

export interface IBCTransferHistoryData {
  readonly historyType: string;
  readonly sourceChainId: string;
  readonly destinationChainId: string;
  readonly channels: {
    portId: string;
    channelId: string;
    counterpartyChainId: string;
  }[];
  readonly sender: string;
  readonly recipient: string;
  readonly amount: {
    readonly amount: string;
    readonly denom: string;
  }[];
  readonly memo: string;
  readonly notificationInfo: {
    readonly currencies: AppCurrency[];
  };
}

export interface IBCTransferTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.IBC_TRANSFER;

  ibcHistoryId?: string;
  readonly ibcHistoryData?: IBCTransferHistoryData;
}

export interface IBCSwapHistoryData {
  readonly swapType: "amount-in" | "amount-out";
  readonly chainId: string;
  readonly destinationChainId: string;
  readonly sender: string;
  readonly amount: {
    amount: string;
    denom: string;
  }[];
  readonly memo: string;
  readonly ibcChannels:
    | {
        portId: string;
        channelId: string;
        counterpartyChainId: string;
      }[];
  readonly destinationAsset: {
    chainId: string;
    denom: string;
  };
  readonly swapChannelIndex: number;
  readonly swapReceiver: string[];
  readonly notificationInfo: {
    currencies: AppCurrency[];
  };
}

export interface IBCSwapTxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.IBC_SWAP;
  ibcHistoryId?: string;
  readonly ibcHistoryData?: IBCSwapHistoryData;
}

export interface SwapV2HistoryData {
  readonly fromChainId: string;
  readonly toChainId: string;
  readonly provider: SwapProvider;
  readonly destinationAsset: {
    chainId: string;
    denom: string;
    expectedAmount: string;
  };
  readonly simpleRoute: {
    isOnlyEvm: boolean;
    chainId: string;
    receiver: string;
  }[];
  readonly sender: string;
  readonly recipient: string;
  readonly amount: {
    readonly amount: string;
    readonly denom: string;
  }[];
  readonly notificationInfo: {
    currencies: AppCurrency[];
  };
  readonly routeDurationSeconds: number;
  readonly isOnlyUseBridge?: boolean;
}

export interface SwapV2TxExecution extends TxExecutionBase {
  readonly type: TxExecutionType.SWAP_V2;

  swapHistoryId?: string;
  readonly swapHistoryData?: SwapV2HistoryData;
}

export type HistoryData =
  | RecentSendHistoryData
  | IBCTransferHistoryData
  | IBCSwapHistoryData
  | SwapV2HistoryData;

export type TxExecution =
  | UndefinedTxExecution
  | SendTxExecution
  | IBCTransferTxExecution
  | IBCSwapTxExecution
  | SwapV2TxExecution;
