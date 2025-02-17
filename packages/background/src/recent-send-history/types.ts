import { AppCurrency } from "@keplr-wallet/types";

export interface RecentSendHistory {
  timestamp: number;
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

export interface IBCTransferHistory {
  recipient: string;
}

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

/**
 * This file is a temporary file to store types that are required for tracking the status of a transaction related to the skip-go.
 * Reference: https://github.com/skip-mev/skip-go/blob/staging/packages/client/src/types/lifecycle.ts
 */

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
  | { stargate_transfer: StargateTransferInfo };
