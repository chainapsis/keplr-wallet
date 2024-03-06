export interface ResMsgsHistory {
  msgs: {
    msg: ResMsg;
    prices?: Record<string, Record<string, number | undefined> | undefined>;
  }[];
}

export interface ResMsg {
  txHash: string;
  code: number;

  height: number;
  time: number;
  chainId: string;
  chainIdentifier: string;

  relation: string;
  msgIndex: number;
  msg: unknown;
  eventStartIndex: number;
  eventEndIndex: number;

  search: string;
  denoms?: string[];
}
