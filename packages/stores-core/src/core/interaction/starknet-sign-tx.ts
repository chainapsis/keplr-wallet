import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import { Call, InvocationsSignerDetails } from "starknet";

export type SignStarknetTxInteractionData = {
  origin: string;
  vaultId: string;
  chainId: string;
  signer: string;
  transactions: Call[];
  details: InvocationsSignerDetails;
};

export class SignStarknetTxInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<SignStarknetTxInteractionData>(
      "request-sign-starknet-tx"
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
    transactions: Call[],
    details: InvocationsSignerDetails,
    afterFn: (proceedNext: boolean) => void | Promise<void>,
    options: {
      preDelay?: number;
    } = {}
  ) {
    await this.interactionStore.approveWithProceedNextV2(
      id,
      {
        transactions,
        details,
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
    await this.interactionStore.rejectAll("request-sign-starknet-tx");
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }
}
