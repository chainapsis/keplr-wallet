import { ChainGetter, HasMapStore } from "@keplr-wallet/stores";
import { StarknetAccountBase } from "./base";
import { Keplr } from "@keplr-wallet/types";

export class StarknetAccountStore extends HasMapStore<StarknetAccountBase> {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    super((chainId: string) => {
      return new StarknetAccountBase(chainGetter, chainId, getKeplr);
    });
  }

  getAccount(chainId: string): StarknetAccountBase {
    const modularChainInfo = this.chainGetter.getModularChain(chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${chainId} is not starknet chain`);
    }
    return this.get(modularChainInfo.chainId);
  }
}
