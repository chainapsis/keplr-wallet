import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";

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

export type SelectableAccount = {
  readonly path: BIP44;
  readonly bech32Address: string;
  readonly isExistent: boolean;
  readonly sequence: string;
  readonly coins: { amount: string; denom: string }[];
};
