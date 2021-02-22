export type CoinTypeForChain = {
  [identifier: string]: number;
};

export type BIP44HDPath = {
  account: number;
  change: number;
  addressIndex: number;
};
