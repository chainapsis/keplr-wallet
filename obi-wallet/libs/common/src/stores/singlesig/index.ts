import { toGenerator } from "@keplr-wallet/common";
import { action, computed, flow, makeObservable, observable } from "mobx";

import { KVStore } from "../../kv-store";

export enum SinglesigState {
  LOADING,
  EMPTY,
  INITIALIZED,
}

export class SinglesigStore {
  @observable
  protected loading = false;

  @observable
  protected mnemonic: string | null = null;

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);
    this.init();
  }

  @flow
  protected *init() {
    const data = yield* toGenerator(
      this.kvStore.get<unknown | undefined>("singlesig")
    );

    if (typeof data === "string") {
      this.mnemonic = data;
    }

    this.loading = false;
  }

  @computed
  public get state(): SinglesigState {
    if (this.loading) return SinglesigState.LOADING;
    if (this.mnemonic === null) return SinglesigState.EMPTY;
    return SinglesigState.INITIALIZED;
  }

  @action
  public setMnemonic(mnemonic: string) {
    this.mnemonic = mnemonic;
    this.loading = false;
    void this.save();
  }

  protected async save() {
    await this.kvStore.set("singlesig", this.mnemonic);
  }
}
