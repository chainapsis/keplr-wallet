export interface AnkrTokenBalance {
  assets: [
    {
      balance: string;
      balanceRawInteger: string;
      balanceUsd: string;
      blockchain: string;
      contractAddress: string;
      holderAddress: string;
      thumbnail: string;
      tokenDecimals: string;
      tokenName: string;
      tokenPrice: string;
      tokenSymbol: string;
      tokenType: string;
    }
  ];
  // TODO: Handle pagination.
  nextPageToken: string;
  totalBalanceUsd: string;
}

export interface AlchemyTokenBalance {
  address: string;
  tokenBalances: {
    contractAddress: string;
    tokenBalance: string | null;
    error: {
      code: number;
      message: string;
    } | null;
  }[];
  pageKey: string;
}
