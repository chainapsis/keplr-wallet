import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import { InteractionWaitingData } from "@keplr-wallet/background";

export class ICNSInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<{
      chainId: string;
      owner: string;
      username: string;
      origin: string;
      accountInfos: {
        chainId: string;
        bech32Prefix: string;
        bech32Address: string;
      }[];
    }>("request-sign-icns-adr36");
  }

  @computed
  get waitingData():
    | InteractionWaitingData<{
        chainId: string;
        owner: string;
        username: string;
        origin: string;
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
    await this.interactionStore.approveWithProceedNextV2(id, {}, afterFn);
  }

  async rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNextV2(id, afterFn);
  }

  async rejectAll() {
    await this.interactionStore.rejectAll("request-sign-icns-adr36");
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }

  isObsoleteInteractionApproved(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteractionApproved(id);
  }
}
