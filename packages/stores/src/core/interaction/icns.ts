import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import {
  InteractionWaitingData,
  RequestICNSAdr36SignaturesMsg,
} from "@keplr-wallet/background";

export class ICNSInteractionStore {
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

  async approveWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.approveWithProceedNext(id, {}, afterFn);
  }

  async rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectAll() {
    await this.interactionStore.rejectAll(RequestICNSAdr36SignaturesMsg.type());
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }
}
