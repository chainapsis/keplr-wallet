import { DeliverTxResponse } from "@cosmjs/stargate";
import { InteractionWaitingData } from "@keplr-wallet/background";
import { InteractionStore as KeplrInteractionStore } from "@keplr-wallet/stores";
import { autorun, computed, flow, makeObservable, observable } from "mobx";

import { RequestObiSignAndBroadcastPayload } from "../background";

export class InteractionStore {
  @observable
  protected _isLoading = false;

  constructor(protected readonly interactionStore: KeplrInteractionStore) {
    makeObservable(this);

    autorun(() => {
      // Reject all interactions that is not first one.
      // This interaction can have only one interaction at once.
      const datas = this.waitingDatas.slice();
      if (datas.length > 1) {
        for (let i = 1; i < datas.length; i++) {
          this.rejectWithId(datas[i].id);
        }
      }
    });
  }

  protected get waitingDatas() {
    return this.interactionStore.getDatas<RequestObiSignAndBroadcastPayload>(
      "request-sign-and-broadcast"
    );
  }

  @computed
  get waitingData():
    | InteractionWaitingData<RequestObiSignAndBroadcastPayload>
    | undefined {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    return datas[0];
  }

  protected isEnded(): boolean {
    return (
      this.interactionStore.getEvents<void>("request-sign-and-broadcast-end")
        .length > 0
    );
  }

  protected clearEnded() {
    this.interactionStore.clearEvent("request-sign-and-broadcast-end");
  }

  protected waitEnd(): Promise<void> {
    if (this.isEnded()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (this.isEnded()) {
          resolve();
          this.clearEnded();
          disposer();
        }
      });
    });
  }

  @flow
  *approveAndWaitEnd(response: DeliverTxResponse) {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    const id = this.waitingDatas[0].id;
    try {
      yield this.interactionStore.approveWithoutRemovingData(id, response);
    } finally {
      // yield this.waitEnd();
      // this.interactionStore.clearEvent("request-sign-and-broadcast-end");
      this.interactionStore.removeData("request-sign-and-broadcast", id);
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    try {
      yield this.interactionStore.reject(
        "request-sign-and-broadcast",
        this.waitingDatas[0].id
      );
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectAll() {
    this._isLoading = true;
    try {
      yield this.interactionStore.rejectAll("request-sign-and-broadcast");
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  protected *rejectWithId(id: string) {
    yield this.interactionStore.reject("request-sign-and-broadcast", id);
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
