import { ChainGetter, HasMapStore } from "@keplr-wallet/stores";
import { BitcoinAccountBase } from "./base";
import { Keplr } from "@keplr-wallet/types";

export class BitcoinAccountStore extends HasMapStore<BitcoinAccountBase> {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    super((chainId: string) => {
      return new BitcoinAccountBase(chainGetter, chainId, getKeplr);
    });
  }

  getAccount(chainId: string): BitcoinAccountBase {
    const modularChainInfo = this.chainGetter.getModularChain(chainId);
    if (!("bitcoin" in modularChainInfo)) {
      throw new Error(`${chainId} is not bitcoin chain`);
    }
    return this.get(modularChainInfo.chainId);
  }
}
