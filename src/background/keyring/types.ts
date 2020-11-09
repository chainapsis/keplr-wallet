export interface TxBuilderConfigPrimitive {
  accountNumber?: string; // bigInteger.BigNumber;
  sequence?: string; // bigInteger.BigNumber;
  gas: string; // bigInteger.BigNumber;
  gasAdjustment?: number;
  memo: string;
  fee: string; // Coin[] | Coin;
  gasPrice?: number;
}

export interface TxBuilderConfigPrimitiveWithChainId
  extends TxBuilderConfigPrimitive {
  chainId: string;
}

export type CoinTypeForChain = {
  [identifier: string]: number;
};

export type BIP44HDPath = {
  account: number;
  change: number;
  addressIndex: number;
};
