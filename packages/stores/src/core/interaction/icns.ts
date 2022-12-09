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
    return this.interactionStore.getDatas<{
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
  *approve(id: string) {
    this._isLoading = true;
    try {
      yield this.interactionStore.approve(
        RequestICNSAdr36SignaturesMsg.type(),
        id,
        {}
      );
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *reject(id: string) {
    this._isLoading = true;
    try {
      yield this.interactionStore.reject(
        RequestICNSAdr36SignaturesMsg.type(),
        id
      );
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
