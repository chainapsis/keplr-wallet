import { InteractionStore } from "./interaction";
import { autorun, flow, makeObservable, observable } from "mobx";
import { StdSignDoc } from "@cosmjs/launchpad";

export class SignInteractionStore {
  @observable
  protected _isLoading: boolean = false;

  constructor(protected readonly interactionStore: InteractionStore) {
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
    return this.interactionStore.getDatas<{
      chainId: string;
      signDoc: StdSignDoc;
    }>("request-sign");
  }

  get waitingData() {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    return datas[0].data;
  }

  protected isEnded(): boolean {
    return this.interactionStore.getDatas<void>("request-sign-end").length > 0;
  }

  protected clearEnded() {
    const datas = this.interactionStore.getDatas<void>("request-sign-end");
    for (const data of datas) {
      this.interactionStore.removeData(data.type, data.id);
    }
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
  *approveAndWaitEnd(newSignDoc: StdSignDoc) {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    try {
      yield this.interactionStore.approve(
        "request-sign",
        this.waitingDatas[0].id,
        newSignDoc
      );
    } finally {
      yield this.waitEnd();

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
        "request-sign",
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
      yield this.interactionStore.rejectAll("request-sign");
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  protected *rejectWithId(id: string) {
    yield this.interactionStore.reject("request-sign", id);
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
