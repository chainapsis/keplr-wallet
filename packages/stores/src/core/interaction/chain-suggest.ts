import { InteractionStore } from "./interaction";
import { ChainInfo } from "@keplr-wallet/types";
import { SuggestChainInfoMsg } from "@keplr-wallet/background";
import { flow, makeObservable, observable } from "mobx";

export class ChainSuggestStore {
  @observable
  protected _isLoading: boolean = false;

  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingSuggestedChainInfo() {
    const datas = this.interactionStore.getDatas<
      ChainInfo & { origin: string }
    >(SuggestChainInfoMsg.type());

    if (datas.length > 0) {
      return datas[0];
    }
  }

  @flow
  *approve() {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedChainInfo;
      if (data) {
        yield this.interactionStore.approve(data.type, data.id, {});
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedChainInfo;
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
      yield this.interactionStore.rejectAll(SuggestChainInfoMsg.type());
    } finally {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
