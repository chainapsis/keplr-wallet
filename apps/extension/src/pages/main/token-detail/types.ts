export interface ResMsgsHistory {
  msgs: {
    msg: MsgHistory;
    prices?: Record<string, Record<string, number | undefined> | undefined>;
  }[];
  nextCursor: string;
  isUnsupported?: boolean;
}

export interface MsgHistory {
  txHash: string;
  code?: number;

  height: number;
  time: string;
  chainId: string;
  chainIdentifier: string;

  relation: string;
  msgIndex: number;
  msg: unknown;
  eventStartIndex: number;
  eventEndIndex: number;

  search: string;
  denoms?: string[];
  meta: Record<string, number | boolean | string | number[] | string[]>;

  ibcTracking?: {
    chainId: string;
    chainIdentifier: string;
    txHeight: number;
    txHash: string;
    msgIndex: number;
    originPortId: string;
    originChannelId: string;
    originSequence: number;
    paths: {
      status: "pending" | "success" | "refunded" | "failed" | "unknown-result";
      chainId?: string;
      chainIdentifier?: string;
      portId: string;
      channelId: string;
      sequence?: number;

      counterpartyChannelId?: string;
      counterpartyPortId?: string;
      clientChainId?: string;
      clientChainIdentifier?: string;

      clientFetched: boolean;
    }[];

    // base64 encoded
    originPacket: string;
  };
}

export interface NativeTransferRelMeta {
  [key: string]: string;
  sender: string;
  receiver: string;
  value: string;
}

export interface ERC20TransferRelMeta {
  [key: string]: string;
  sender: string;
  receiver: string;
  value: string;
  contract: string;
}
