import { action, computed, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { ITxChainSetter } from "./types";
import { ModularChainInfo } from "@keplr-wallet/types";

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
  get modularChainInfo(): ModularChainInfo {
    return this.chainGetter.getModularChain(this.chainId);
  }

  get chainId(): string {
    return this._chainId;
  }

  @action
  setChain(chainId: string) {
    this._chainId = chainId;
  }
}
