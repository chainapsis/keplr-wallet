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

  ibcHistory:
    | {
        portId: string;
        channelId: string;
        counterpartyChainId: string;

        sequence?: string;

        completed: boolean;
        error?: string;
        rewound?: boolean;
      }[];
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
}
