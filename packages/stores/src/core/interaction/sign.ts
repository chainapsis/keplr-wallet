import {
  InteractionStore,
  InteractionWaitingDataWithObsolete,
} from "./interaction";
import { computed, makeObservable } from "mobx";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import { KeplrSignOptions, StdSignDoc } from "@keplr-wallet/types";

export type SignInteractionData =
  | {
      origin: string;
      chainId: string;
      mode: "amino";
      signer: string;
      signDoc: StdSignDoc;
      signOptions: KeplrSignOptions & {
        isADR36WithString?: boolean;
      };
    }
  | {
      origin: string;
      chainId: string;
      mode: "direct";
      signer: string;
      signDocBytes: Uint8Array;
      signOptions: KeplrSignOptions;
    };

export class SignInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<SignInteractionData>(
      "request-sign-cosmos"
    );
  }

  @computed
  get waitingData():
    | InteractionWaitingDataWithObsolete<
        SignInteractionData & { signDocWrapper: SignDocWrapper }
      >
    | undefined {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    const data = datas[0];
    const wrapper =
      data.data.mode === "amino"
        ? SignDocWrapper.fromAminoSignDoc(data.data.signDoc)
        : SignDocWrapper.fromDirectSignDocBytes(data.data.signDocBytes);

    return {
      id: data.id,
      type: data.type,
      isInternal: data.isInternal,
      obsolete: data.obsolete,
      data: {
        ...data.data,
        signDocWrapper: wrapper,
      },
    };
  }

  async approveWithProceedNext(
    id: string,
    newSignDocWrapper: SignDocWrapper,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.approveWithProceedNext(
      id,
      newSignDocWrapper,
      afterFn
    );
  }

  async rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectAll() {
    await this.interactionStore.rejectAll("request-sign-cosmos");
  }
}
