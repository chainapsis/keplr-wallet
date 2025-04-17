import { PlainObject } from "@keplr-wallet/background";
import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import { BitcoinSignMessageType } from "@keplr-wallet/types";
import { Network } from "bitcoinjs-lib";

export type SignBitcoinMessageInteractionData = {
  origin: string;
  vaultId: string;
  chainId: string;
  address: string;
  pubKey: Uint8Array;
  network: Network;
  message: string;
  signType: BitcoinSignMessageType;
  keyType: string;
  keyInsensitive: PlainObject;
};

export class SignBitcoinMessageInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<SignBitcoinMessageInteractionData>(
      "request-sign-bitcoin-message"
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
    message: string,
    signature: string | undefined,
    afterFn: (proceedNext: boolean) => void | Promise<void>,
    options: {
      preDelay?: number;
    } = {}
  ) {
    await this.interactionStore.approveWithProceedNextV2(
      id,
      {
        message,
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
    await this.interactionStore.rejectAll("request-sign-bitcoin-message");
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }

  isObsoleteInteractionApproved(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteractionApproved(id);
  }
}
