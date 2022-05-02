import { action, computed, makeObservable, observable } from "mobx";
import { ChainGetter, IChainInfoImpl } from "@keplr-wallet/stores";
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
  get chainInfo(): IChainInfoImpl {
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
