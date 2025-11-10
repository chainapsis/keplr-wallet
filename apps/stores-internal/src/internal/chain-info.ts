import { IChainStore } from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";

export interface InternalChainStore<C extends ChainInfo = ChainInfo>
  extends IChainStore<C> {
  isInChainInfosInListUI(chainId: string): boolean;
  isInModularChainInfosInListUI(chainId: string): boolean;
}
