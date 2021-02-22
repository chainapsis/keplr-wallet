import { InteractionStore } from "./interaction";
import { computed, flow, makeObservable, observable } from "mobx";
import { BACKGROUND_PORT, MessageRequester } from "@keplr/router";
import {
  LedgerGetWebHIDFlagMsg,
  LedgerSetWebHIDFlagMsg,
} from "@keplr/background";
import { toGenerator } from "@keplr/common";

export type LedgerInitDataType =
  | {
      event: "get-pubkey";
      success: boolean;
    }
  | {
      event: "sign";
      success: boolean;
    }
  | {
      // Should interact to resume the ledger initing on the background.
      event: "init-failed";
    }
  | {
      event: "init-aborted";
    };

export class LedgerInitStore {
  @observable
  protected _isLoading: boolean = false;

  @observable
  protected _isWebHID: boolean = false;

  constructor(
    protected readonly interactionStore: InteractionStore,
    protected readonly msgRequester: MessageRequester
  ) {
    makeObservable(this);

    this.fetchIsWebHID();
  }

  @flow
  *fetchIsWebHID() {
    this._isWebHID = yield* toGenerator(
      this.msgRequester.sendMessage(
        BACKGROUND_PORT,
        new LedgerGetWebHIDFlagMsg()
      )
    );
  }

  @flow
  *setWebHID(flag: boolean) {
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new LedgerSetWebHIDFlagMsg(flag)
    );
    yield this.fetchIsWebHID();
  }

  get isWebHID(): boolean {
    return this._isWebHID;
  }

  @computed
  get isGetPubKeySucceeded(): boolean {
    const datas = this.interactionStore.getDatas<LedgerInitDataType>(
      "ledger-init"
    );

    for (const data of datas) {
      if (data.data.event === "get-pubkey" && data.data.success) {
        return true;
      }
    }

    return false;
  }

  @computed
  get isSignCompleted(): boolean {
    return this.isSignSucceeded || this.isSignRejected;
  }

  @computed
  get isSignSucceeded(): boolean {
    const datas = this.interactionStore.getDatas<LedgerInitDataType>(
      "ledger-init"
    );

    for (const data of datas) {
      if (data.data.event === "sign" && data.data.success) {
        return true;
      }
    }

    return false;
  }

  @computed
  get isSignRejected(): boolean {
    const datas = this.interactionStore.getDatas<LedgerInitDataType>(
      "ledger-init"
    );

    for (const data of datas) {
      if (data.data.event === "sign" && !data.data.success) {
        return true;
      }
    }

    return false;
  }

  @computed
  get isInitAborted(): boolean {
    const datas = this.interactionStore.getDatas<LedgerInitDataType>(
      "ledger-init"
    );

    for (const data of datas) {
      if (data.data.event === "init-aborted") {
        return true;
      }
    }

    return false;
  }

  @flow
  *resume() {
    this._isLoading = true;

    try {
      const datas = this.interactionStore.getDatas<LedgerInitDataType>(
        "ledger-init"
      );

      for (const data of datas) {
        if (data.data.event === "init-failed") {
          // Approve resuming the initing ledger.
          yield this.interactionStore.approve("ledger-init", data.id, {});
          break;
        }
      }
    } finally {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
