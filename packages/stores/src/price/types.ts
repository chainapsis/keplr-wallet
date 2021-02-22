export type CoinGeckoSimplePrice = {
  [coinId: string]: {
    [vsCurrency: string]: number;
  };
};
