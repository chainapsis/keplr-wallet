import { InteractionStore } from "./interaction";
import { SwitchNetworkByChainIdMsg } from "@keplr-wallet/background";
import { flow, makeObservable, observable } from "mobx";

export class ChainSwitchStore {
  @observable
  protected _isLoading: boolean = false;

  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingSuggestedChainId() {
    const datas = this.interactionStore.getDatas<{
      chainId: string;
      origin: string;
    }>(SwitchNetworkByChainIdMsg.type());

    if (datas.length > 0) {
      return datas[0];
    }
  }

  @flow
  *approve(chainId: string) {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedChainId;

      if (data) {
        yield this.interactionStore.approve(data.type, data.id, chainId);
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedChainId;
      if (data) {
        yield this.interactionStore.reject(data.type, data.id);
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectAll() {
    this._isLoading = true;
    try {
      yield this.interactionStore.rejectAll(SwitchNetworkByChainIdMsg.type());
    } finally {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
