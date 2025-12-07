import { AppCurrency, SwapProvider } from "@keplr-wallet/types";

export { SwapProvider };

// ============================================================================
// RecentSend History Types
// ============================================================================

/**
 * Base interface for RecentSendHistory data.
 * Contains common fields between RecentSendHistoryData and RecentSendHistory.
 */
export interface RecentSendHistoryBase {
  sender: string;
  recipient: string;
  amount: {
    amount: string;
    denom: string;
  }[];
  memo: string;
  ibcChannels:
    | {
        portId: string;
        channelId: string;
        counterpartyChainId: string;
      }[]
    | undefined;
}

/**
 * Data required to record a recent send history.
 * Used by tx-executor when creating history entries.
 */
export interface RecentSendHistoryData extends RecentSendHistoryBase {
  readonly chainId: string;
  readonly historyType: string;
}

/**
 * Stored recent send history record.
 */
export interface RecentSendHistory extends RecentSendHistoryBase {
  timestamp: number;
}

// ============================================================================
// IBC History Types (Transfer & Swap)
// ============================================================================

/**
 * Data required to record an IBC transfer history.
 * Used by tx-executor when creating history entries.
 */
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

/**
 * Data required to record an IBC swap history.
 * Used by tx-executor when creating history entries.
 */
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
  readonly ibcChannels: {
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

/**
 * Stored IBC transfer history record (subset of IBCHistory).
 */
export interface IBCTransferHistory {
  recipient: string;
}

/**
 * Stored IBC swap history record (subset of IBCHistory).
 */
export interface IBCSwapHistory {
  swapType: "amount-in" | "amount-out";
  swapChannelIndex: number;
  swapReceiver: string[];

  destinationAsset: {
    chainId: string;
    denom: string;
  };

  resAmount: {
    amount: string;
    denom: string;
  }[][];

  swapRefundInfo?: {
    chainId: string;
    amount: {
      amount: string;
      denom: string;
    }[];
  };
}

/**
 * Stored IBC history record (union of IBCTransferHistory and IBCSwapHistory).
 */
export type IBCHistory = {
  id: string;
  chainId: string;
  destinationChainId: string;
  timestamp: number;
  sender: string;

  amount: {
    amount: string;
    denom: string;
  }[];
  memo: string;

  txHash: string;

  backgroundExecutionId?: string;

  txFulfilled?: boolean;
  txError?: string;
  packetTimeout?: boolean;

  ibcHistory:
    | {
        portId: string;
        channelId: string;
        counterpartyChainId: string;

        sequence?: string;
        // 위의 channel id는 src channel id이고
        // 얘는 dst channel id이다
        // 각 tracking이 완료될때마다 events에서 찾아서 추가된다.
        dstChannelId?: string;

        completed: boolean;
        error?: string;
        rewound?: boolean;
        // swap 이후에는 rewind가 불가능하기 때문에
        // swap 등에서는 이 값이 true일 수 있음
        rewoundButNextRewindingBlocked?: boolean;
      }[];

  // Already notified to user
  notified?: boolean;
  notificationInfo?: {
    currencies: AppCurrency[];
  };
} & (IBCTransferHistory | IBCSwapHistory);

// ============================================================================
// SwapV2 History Types
// ============================================================================

export enum SwapV2RouteStepStatus {
  IN_PROGRESS = "in_progress",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum SwapV2TxStatus {
  IN_PROGRESS = "in_progress",
  SUCCESS = "success",
  PARTIAL_SUCCESS = "partial_success",
  FAILED = "failed",
}

export interface SwapV2TxStatusStep {
  chain_id: string;
  status: SwapV2RouteStepStatus;
  tx_hash?: string;
  explorer_url?: string;
}

export interface SwapV2AssetLocation {
  chain_id: string;
  denom: string;
  amount: string;
}

export interface SwapV2TxStatusRequest {
  provider: SwapProvider;
  from_chain: string;
  to_chain?: string; // optional, used by Squid
  tx_hash: string;
}

export interface SwapV2TxStatusResponse {
  provider: SwapProvider;
  status: SwapV2TxStatus;
  steps: SwapV2TxStatusStep[];
  asset_location?: SwapV2AssetLocation | null;
}

/**
 * Base interface for SwapV2History data.
 * Contains common fields between SwapV2HistoryData and SwapV2History.
 */
export interface SwapV2HistoryBase {
  fromChainId: string;
  toChainId: string;
  provider: SwapProvider;
  sender: string;
  recipient: string;
  amount: {
    amount: string;
    denom: string;
  }[];
  simpleRoute: {
    isOnlyEvm: boolean;
    chainId: string;
    receiver: string;
  }[];
  destinationAsset: {
    chainId: string;
    denom: string;
    expectedAmount: string;
  };
  routeDurationSeconds: number;
  notificationInfo: {
    currencies: AppCurrency[];
  };
  isOnlyUseBridge?: boolean;
}

/**
 * Data required to record a SwapV2 history.
 * Used by tx-executor when creating history entries.
 */
export type SwapV2HistoryData = SwapV2HistoryBase;

/**
 * Stored SwapV2 history record.
 */
export interface SwapV2History extends SwapV2HistoryBase {
  id: string;
  timestamp: number;
  txHash: string;

  status: SwapV2TxStatus;
  routeIndex: number; // 현재까지 진행된 라우팅 인덱스

  resAmount: {
    amount: string;
    denom: string;
  }[][];

  swapRefundInfo?: {
    chainId: string;
    amount: {
      amount: string;
      denom: string;
    }[];
  };

  backgroundExecutionId?: string;

  trackDone?: boolean; // status tracking이 완료되었는지 여부
  trackError?: string; // status tracking 중 에러가 발생했는지 여부
  finalizationRetryCount?: number; // success/partial_success/failed 상태에서 currentStep이 진행 중일 때 추가 polling 횟수

  notified?: boolean;

  hidden?: boolean;
  // 멀티 tx swap의 경우, 모든 트랜잭션이 서명되지 않아 hidden 처리되었더라도
  // 다음 트랜잭션 처리가 필요한 경우 강제로 다시 display하기 위한 플래그
  requiresNextTransaction?: boolean;
}

// ============================================================================
// Skip History Types (Legacy)
// ============================================================================

export type SkipHistory = {
  id: string;
  chainId: string;
  destinationChainId: string;
  timestamp: number;
  sender: string;
  recipient: string;

  amount: {
    amount: string;
    denom: string;
  }[]; // [sourceChain asset, destinationChain asset] 형태로 저장
  txHash: string; // hex string

  trackDone?: boolean; // status tracking이 완료되었는지 여부
  trackError?: string; // status tracking 중 에러가 발생했는지 여부
  trackStatus?: StatusState; // status tracking의 현재 상태

  notified?: boolean;
  notificationInfo?: {
    currencies: AppCurrency[];
  };

  simpleRoute: {
    isOnlyEvm: boolean;
    chainId: string;
    receiver: string;
  }[]; // 세부적인 채널 정보를 제외, 덩어리 경로 정보만 저장
  routeIndex: number; // 현재까지 진행된 라우팅 인덱스
  routeDurationSeconds: number; // 라우팅에 걸리는 예상 시간

  destinationAsset: {
    chainId: string;
    denom: string;
    expectedAmount?: string;
  }; // 최종 목적지의 asset 정보

  resAmount: {
    amount: string;
    denom: string;
  }[][];

  swapRefundInfo?: {
    chainId: string;
    amount: {
      amount: string;
      denom: string;
    }[];
  };

  transferAssetRelease?: TransferAssetRelease; // 라우팅 중간에 실패한 경우, 사용자의 자산이 어디에서 릴리즈 되었는지 정보
  isOnlyUseBridge?: boolean; // send bridge 페이지에서 swap코드를 사용 하고 있기 때문에 브릿지만 사용했는지 여부 필요함
};

// ============================================================================
// History Data Union Type
// ============================================================================

/**
 * Union type of all history data types.
 */
export type HistoryData =
  | RecentSendHistoryData
  | IBCTransferHistoryData
  | IBCSwapHistoryData
  | SwapV2HistoryData;

// ============================================================================
// Skip/Bridge Tracking Types
// Reference: https://github.com/skip-mev/skip-go/blob/staging/packages/client/src/types/lifecycle.ts
// ============================================================================

export type StatusState =
  | "STATE_UNKNOWN"
  | "STATE_SUBMITTED"
  | "STATE_PENDING" // route is in progress
  | "STATE_RECEIVED"
  | "STATE_COMPLETED" // route is completed
  | "STATE_ABANDONED" // Tracking has stopped
  | "STATE_COMPLETED_SUCCESS" // The route has completed successfully
  | "STATE_COMPLETED_ERROR" // The route errored somewhere and the user has their tokens unlocked in one of their wallets
  | "STATE_PENDING_ERROR"; // The route is in progress and an error has occurred somewhere (specially for IBC, where the asset is locked on the source chain)

export type NextBlockingTransfer = {
  transfer_sequence_index: number;
};

export type StatusRequest = {
  tx_hash: string;
  chain_id: string;
};

// This is for the IBC transfer
export type TransferState =
  | "TRANSFER_UNKNOWN"
  | "TRANSFER_PENDING"
  | "TRANSFER_RECEIVED" // The packet has been received on the destination chain
  | "TRANSFER_SUCCESS" // The packet has been successfully acknowledged
  | "TRANSFER_FAILURE";

export type TransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  state: TransferState;
  packet_txs: Packet;

  // Deprecated
  src_chain_id: string;
  dst_chain_id: string;
};

export type TransferAssetRelease = {
  chain_id: string; // Chain where the assets are released or will be released
  denom: string; // Denom of the tokens the user will have
  released: boolean; //  Boolean given whether the funds are currently available (if the state is STATE_PENDING_ERROR , this will be false)
};

export type TxStatusResponse = {
  status: StatusState;
  transfer_sequence: TransferEvent[];
  next_blocking_transfer: NextBlockingTransfer | null; // give the index of the next blocking transfer in the sequence
  transfer_asset_release: TransferAssetRelease | null; // Info about where the users tokens will be released when the route completes ()
  error: StatusError | null;
  state: StatusState;
  transfers: TransferStatus[];
};

export type TransferStatus = {
  state: StatusState;
  transfer_sequence: TransferEvent[];
  next_blocking_transfer: NextBlockingTransfer | null;
  transfer_asset_release: TransferAssetRelease | null;
  error: StatusError | null;
};

export type Packet = {
  send_tx: ChainTransaction | null;
  receive_tx: ChainTransaction | null;
  acknowledge_tx: ChainTransaction | null;
  timeout_tx: ChainTransaction | null;

  error: PacketError | null;
};

export type StatusErrorType =
  | "STATUS_ERROR_UNKNOWN"
  | "STATUS_ERROR_TRANSACTION_EXECUTION"
  | "STATUS_ERROR_INDEXING";

export type TransactionExecutionError = {
  code: number;
  message: string;
};

export type StatusError = {
  code: number;
  message: string;
  type: StatusErrorType;
  details: {
    transactionExecutionError: TransactionExecutionError;
  };
};

export type PacketErrorType =
  | "PACKET_ERROR_UNKNOWN"
  | "PACKET_ERROR_ACKNOWLEDGEMENT"
  | "PACKET_ERROR_TIMEOUT";

export type AcknowledgementError = {
  message: string;
  code: number;
};

export type PacketError = {
  code: number;
  message: string;
  type: PacketErrorType;
  details: {
    acknowledgement_error: AcknowledgementError;
  };
};

export type ChainTransaction = {
  chain_id: string;
  tx_hash: string;
  explorer_link: string;
};

export type TrackTxRequest = {
  tx_hash: string;
  chain_id: string;
};

export type TrackTxResponse = {
  tx_hash: string;
  explorer_link: string;
};

export type AxelarTransferType =
  | "AXELAR_TRANSFER_CONTRACT_CALL_WITH_TOKEN"
  | "AXELAR_TRANSFER_SEND_TOKEN";

export type AxelarTransferState =
  | "AXELAR_TRANSFER_UNKNOWN"
  | "AXELAR_TRANSFER_PENDING_CONFIRMATION"
  | "AXELAR_TRANSFER_PENDING_RECEIPT"
  | "AXELAR_TRANSFER_SUCCESS" // Desirable state
  | "AXELAR_TRANSFER_FAILURE";

export type AxelarTransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  type: AxelarTransferType;
  state: AxelarTransferState;
  txs: AxelarTransferTransactions;
  axelar_scan_link: string;

  // Deprecated
  src_chain_id: string;
  dst_chain_id: string;
};

export type AxelarTransferTransactions =
  | {
      contract_call_with_token_txs: ContractCallWithTokenTransactions;
    }
  | {
      send_token_txs: SendTokenTransactions;
    };

export type ContractCallWithTokenTransactions = {
  send_tx: ChainTransaction | null;
  gas_paid_tx: ChainTransaction | null;
  confirm_tx: ChainTransaction | null;
  approve_tx: ChainTransaction | null;
  execute_tx: ChainTransaction | null;
  error: ContractCallWithTokenError | null;
};

export type ContractCallWithTokenError = {
  message: string;
  type: ContractCallWithTokenErrorType;
};

export type ContractCallWithTokenErrorType =
  "CONTRACT_CALL_WITH_TOKEN_EXECUTION_ERROR";

export type SendTokenTransactions = {
  send_tx: ChainTransaction | null;
  confirm_tx: ChainTransaction | null;
  execute_tx: ChainTransaction | null;
  error: SendTokenError | null;
};

export type SendTokenErrorType = "SEND_TOKEN_EXECUTION_ERROR";

export type SendTokenError = {
  message: string;
  type: SendTokenErrorType;
};

export type CCTPTransferState =
  | "CCTP_TRANSFER_UNKNOWN"
  | "CCTP_TRANSFER_SENT"
  | "CCTP_TRANSFER_PENDING_CONFIRMATION"
  | "CCTP_TRANSFER_CONFIRMED"
  | "CCTP_TRANSFER_RECEIVED"; // Desirable state

export type CCTPTransferTransactions = {
  send_tx: ChainTransaction | null;
  receive_tx: ChainTransaction | null;
};

export type CCTPTransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  state: CCTPTransferState;
  txs: CCTPTransferTransactions;

  // Deprecated
  src_chain_id: string;
  dst_chain_id: string;
};

export type HyperlaneTransferState =
  | "HYPERLANE_TRANSFER_UNKNOWN"
  | "HYPERLANE_TRANSFER_SENT"
  | "HYPERLANE_TRANSFER_FAILED"
  | "HYPERLANE_TRANSFER_RECEIVED"; // Desirable state

export type HyperlaneTransferTransactions = {
  send_tx: ChainTransaction | null;
  receive_tx: ChainTransaction | null;
};

export type HyperlaneTransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  state: HyperlaneTransferState;
  txs: HyperlaneTransferTransactions;
};

export type GoFastTransferTransactions = {
  order_submitted_tx: ChainTransaction | null;
  order_filled_tx: ChainTransaction | null;
  order_refunded_tx: ChainTransaction | null;
  order_timeout_tx: ChainTransaction | null;
};

export type GoFastTransferState =
  | "GO_FAST_TRANSFER_UNKNOWN"
  | "GO_FAST_TRANSFER_SENT"
  | "GO_FAST_POST_ACTION_FAILED"
  | "GO_FAST_TRANSFER_TIMEOUT"
  | "GO_FAST_TRANSFER_FILLED" // Desirable state
  | "GO_FAST_TRANSFER_REFUNDED";

export type GoFastTransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  state: GoFastTransferState;
  txs: GoFastTransferTransactions;
};

export type StargateTransferState =
  | "STARGATE_TRANSFER_UNKNOWN"
  | "STARGATE_TRANSFER_SENT"
  | "STARGATE_TRANSFER_RECEIVED" // Desirable state
  | "STARGATE_TRANSFER_FAILED";

export type StargateTransferTransactions = {
  send_tx: ChainTransaction | null;
  receive_tx: ChainTransaction | null;
  error_tx: ChainTransaction | null;
};

export type StargateTransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  state: StargateTransferState;
  txs: StargateTransferTransactions;
};

export type OPInitTransferState =
  | "OPINIT_TRANSFER_UNKNOWN"
  | "OPINIT_TRANSFER_SENT"
  | "OPINIT_TRANSFER_RECEIVED"; // Desirable state

export type OPInitTransferTransactions = {
  send_tx: ChainTransaction | null;
  receive_tx: ChainTransaction | null;
};

export type OPInitTransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  state: OPInitTransferState;
  txs: OPInitTransferTransactions;
};

export type EurekaTransferState =
  | "TRANSFER_UNKNOWN"
  | "TRANSFER_PENDING"
  | "TRANSFER_RECEIVED"
  | "TRANSFER_SUCCESS" // Desirable state
  | "TRANSFER_FAILURE";

export type EurekaTransferTransactions = {
  send_tx: ChainTransaction | null;
  acknowledge_tx: ChainTransaction | null;
  receive_tx: ChainTransaction | null;
  timeout_tx: ChainTransaction | null;
};

export type EurekaTransferInfo = {
  from_chain_id: string;
  to_chain_id: string;
  state: EurekaTransferState;
  packet_txs: EurekaTransferTransactions;
};

export type TransferEvent =
  | {
      ibc_transfer: TransferInfo;
    }
  | {
      axelar_transfer: AxelarTransferInfo;
    }
  | { cctp_transfer: CCTPTransferInfo }
  | { hyperlane_transfer: HyperlaneTransferInfo }
  | { op_init_transfer: OPInitTransferInfo }
  | { go_fast_transfer: GoFastTransferInfo }
  | { stargate_transfer: StargateTransferInfo }
  | { eureka_transfer: EurekaTransferInfo };
