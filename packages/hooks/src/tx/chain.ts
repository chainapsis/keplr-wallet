import { action, computed, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { ITxChainSetter } from "./types";

export class TxChainSetter implements ITxChainSetter {
  @observable
  protected _chainId: string;

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string
  ) {
    this._chainId = initialChainId;

    makeObservable(this);
  }

  @computed
  get chainInfo(): ChainInfo & {
    raw: ChainInfo;
    addUnknownCurrencies(...coinMinimalDenoms: string[]): void;
    findCurrency(coinMinimalDenom: string): AppCurrency | undefined;
    forceFindCurrency(coinMinimalDenom: string): AppCurrency;
  } {
    return this.chainGetter.getChain(this.chainId);
  }

  get chainId(): string {
    return this._chainId;
  }

  @action
  setChain(chainId: string) {
    this._chainId = chainId;
  }
}
