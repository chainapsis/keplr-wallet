import { AppCurrency } from "@keplr-wallet/types";
import { TransferAssetRelease } from "./temp-skip-types";

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

  amount: {
    amount: string;
    denom: string;
  }[];
  txHash: string;

  txFulfilled?: boolean;
  txError?: string;

  notified?: boolean;
  notificationInfo?: {
    currencies: AppCurrency[];
  };

  simpleRoute: { isOnlyEvm: boolean; chainId: string; receiver: string }[];
  routeIndex: number;
  routeDurationSeconds: number;

  destinationAsset: {
    chainId: string;
    denom: string;
    expectedAmount: string;
  };

  resAmount: {
    amount: string;
    denom: string;
  }[][];

  transferAssetRelease?: TransferAssetRelease;
};
