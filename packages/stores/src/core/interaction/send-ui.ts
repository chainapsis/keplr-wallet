import { InteractionStore } from "./interaction";
import { autorun, flow, makeObservable, observable } from "mobx";
import { OpenSendUIMsg } from "@keplr-wallet/background";

export class SendUIInteractionStore {
  @observable
  protected _isLoading: boolean = false;

  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);

    autorun(() => {
      // Reject all interactions that is not first one.
      // This interaction can have only one interaction at once.
      const datas = this.waitingSendUIInteractionDatas.slice();
      if (datas.length > 1) {
        for (let i = 1; i < datas.length; i++) {
          this.rejectWithId(datas[i].id);
        }
      }
    });
  }

  get waitingSendUIInteractionData() {
    const datas = this.waitingSendUIInteractionDatas;

    if (datas.length > 0) {
      return datas[0];
    }
  }

  protected get waitingSendUIInteractionDatas() {
    return this.interactionStore.getDatas<void>(OpenSendUIMsg.type());
  }

  @flow
  *approve(txHash: string) {
    this._isLoading = true;

    try {
      const data = this.waitingSendUIInteractionData;
      if (data) {
        yield this.interactionStore.approve(data.type, data.id, {
          txHash,
        });
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    this._isLoading = true;

    try {
      const data = this.waitingSendUIInteractionData;
      if (data) {
        yield this.interactionStore.reject(data.type, data.id);
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  protected *rejectWithId(id: string) {
    yield this.interactionStore.reject(OpenSendUIMsg.type(), id);
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
