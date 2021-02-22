import { ChainInfo } from "@keplr/types";

export interface ChainGetter {
  // Return the chain info matched with chain id.
  // Expect that this method will return the chain info reactively,
  // so it is possible to detect the chain info changed without any additional effort.
  getChain(chainId: string): ChainInfo;
}

export type CoinPrimitive = {
  denom: string;
  amount: string;
};
