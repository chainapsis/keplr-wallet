import { PlainObject } from "@keplr-wallet/background";
import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import { Network } from "bitcoinjs-lib";

export type SignBitcoinTxInteractionData = {
  origin: string;
  vaultId: string;
  chainId: string;
  address: string;
  pubKey: Uint8Array;
  network: Network;
  keyType: string;
  keyInsensitive: PlainObject;
} & (
  | {
      psbtHex: string;
      signedPsbtHex: string;
    }
  | {
      psbtsHexes: string[];
      signedPsbtsHexes: string[];
    }
  | {
      psbtCandidate: {
        toAddress: string;
        amount: number;
      };
    }
);

export class SignBitcoinTxInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<SignBitcoinTxInteractionData>(
      "request-sign-bitcoin-psbt"
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
    psbtSignData: {
      psbtHex: string;
      inputsToSign: number[];
    }[],
    signedPsbtsHexes: string[],
    afterFn: (proceedNext: boolean) => void | Promise<void>,
    options: {
      preDelay?: number;
    } = {}
  ) {
    await this.interactionStore.approveWithProceedNextV2(
      id,
      {
        psbtSignData,
        signedPsbtsHexes,
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
    await this.interactionStore.rejectAll("request-sign-bitcoin-psbt");
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }

  isObsoleteInteractionApproved(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteractionApproved(id);
  }
}
