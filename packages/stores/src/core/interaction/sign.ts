import { InteractionStore } from "./interaction";
import { autorun, computed, flow, makeObservable, observable } from "mobx";
import { StdSignDoc } from "@cosmjs/launchpad";
import { InteractionWaitingData } from "@keplr-wallet/background";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import { KeplrSignOptions } from "@keplr-wallet/types";

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
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          mode: "amino";
          signer: string;
          signDoc: StdSignDoc;
          signOptions: KeplrSignOptions;
        }
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          signer: string;
          signDocBytes: Uint8Array;
          signOptions: KeplrSignOptions;
        }
    >("request-sign");
  }

  @computed
  get waitingData():
    | InteractionWaitingData<{
        msgOrigin: string;
        signer: string;
        signDocWrapper: SignDocWrapper;
        signOptions: KeplrSignOptions;
      }>
    | undefined {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    const data = datas[0];
    const wrapper =
      data.data.mode === "amino"
        ? SignDocWrapper.fromAminoSignDoc(data.data.signDoc)
        : new SignDocWrapper(data.data.mode, data.data.signDocBytes);

    return {
      id: data.id,
      type: data.type,
      isInternal: data.isInternal,
      data: {
        msgOrigin: data.data.msgOrigin,
        signer: data.data.signer,
        signDocWrapper: wrapper,
        signOptions: data.data.signOptions,
      },
    };
  }

  protected isEnded(): boolean {
    return this.interactionStore.getEvents<void>("request-sign-end").length > 0;
  }

  protected clearEnded() {
    this.interactionStore.clearEvent("request-sign-end");
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
  *approveAndWaitEnd(newSignDocWrapper: SignDocWrapper) {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    const id = this.waitingDatas[0].id;
    try {
      const newSignDoc =
        newSignDocWrapper.mode === "amino"
          ? newSignDocWrapper.aminoSignDoc
          : newSignDocWrapper.protoSignDoc.toBytes();

      yield this.interactionStore.approveWithoutRemovingData(id, newSignDoc);
    } finally {
      yield this.waitEnd();
      this.interactionStore.removeData("request-sign", id);

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
