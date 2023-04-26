import { InteractionStore } from "./interaction";
import { computed, flow, makeObservable, observable } from "mobx";
import {
  InteractionWaitingData,
  RequestICNSAdr36SignaturesMsg,
} from "@keplr-wallet/background";

export class ICNSInteractionStore {
  @observable
  protected _isLoading: boolean = false;

  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<{
      chainId: string;
      owner: string;
      username: string;
      accountInfos: {
        chainId: string;
        bech32Prefix: string;
        bech32Address: string;
      }[];
    }>(RequestICNSAdr36SignaturesMsg.type());
  }

  @computed
  get waitingData():
    | InteractionWaitingData<{
        chainId: string;
        owner: string;
        username: string;
        accountInfos: {
          chainId: string;
          bech32Prefix: string;
          bech32Address: string;
        }[];
      }>
    | undefined {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    return datas[0];
  }

  @flow
  *approveWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    this._isLoading = true;
    try {
      yield this.interactionStore.approveWithProceedNext(id, {}, afterFn);
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    this._isLoading = true;
    try {
      yield this.interactionStore.rejectWithProceedNext(id, afterFn);
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectAll() {
    this._isLoading = true;
    try {
      yield this.interactionStore.rejectAll(
        RequestICNSAdr36SignaturesMsg.type()
      );
    } finally {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
