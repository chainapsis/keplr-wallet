export interface ResMsgsHistory {
  msgs: {
    msg: MsgHistory;
    prices?: Record<string, Record<string, number | undefined> | undefined>;
  }[];
  nextCursor: string;
}

export interface MsgHistory {
  txHash: string;
  code: number;

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
}
