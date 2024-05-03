import { InteractionStore } from "./interaction";
import { SwitchAccountMsg } from "@keplr-wallet/background";
import { flow, makeObservable, observable } from "mobx";

export class AccountSwitchStore {
  @observable
  protected _isLoading: boolean = false;

  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingSuggestedAccount() {
    const datas = this.interactionStore.getDatas<{
      address: string;
      origin: string;
    }>(SwitchAccountMsg.type());

    if (datas.length > 0) {
      return datas[0];
    }
  }

  @flow
  *approve(address: string) {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedAccount;

      if (data) {
        yield this.interactionStore.approve(data.type, data.id, address);
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedAccount;
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
      yield this.interactionStore.rejectAll(SwitchAccountMsg.type());
    } finally {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
