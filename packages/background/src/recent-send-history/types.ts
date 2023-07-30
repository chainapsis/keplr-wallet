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

export interface IBCTransferHistory {
  id: string;

  chainId: string;
  destinationChainId: string;
  timestamp: number;
  sender: string;
  recipient: string;
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
      }[];
}
