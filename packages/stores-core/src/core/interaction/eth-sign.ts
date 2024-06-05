import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import { EthSignType } from "@keplr-wallet/types";
import { PlainObject } from "@keplr-wallet/background";

export type SignEthereumInteractionData = {
  origin: string;
  chainId: string;
  signer: string;
  pubKey: Uint8Array;
  message: Uint8Array;
  signType: EthSignType;
  keyType: string;
  keyInsensitive: PlainObject;
};

export class SignEthereumInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<SignEthereumInteractionData>(
      "request-sign-ethereum"
    );
  }

  @computed
  get waitingData() {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    return datas[0];
  }

  async approveWithProceedNext(
    id: string,
    signingData: Uint8Array,
    signature: Uint8Array | undefined,
    afterFn: (proceedNext: boolean) => void | Promise<void>,
    options: {
      preDelay?: number;
    } = {}
  ) {
    await this.interactionStore.approveWithProceedNextV2(
      id,
      {
        signingData,
        signature,
      },
      afterFn,
      options
    );
  }

  async rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectAll() {
    await this.interactionStore.rejectAll("request-sign-ethereum");
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }
}
