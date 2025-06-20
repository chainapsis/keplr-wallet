import { action, computed, makeObservable, observable } from "mobx";
import { ChainGetter, IModularChainInfoImpl } from "@keplr-wallet/stores";
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
  get modularChainInfo(): IModularChainInfoImpl {
    return this.chainGetter.getModularChainInfoImpl(this.chainId);
  }

  get chainId(): string {
    return this._chainId;
  }

  @action
  setChain(chainId: string) {
    this._chainId = chainId;
  }
}
