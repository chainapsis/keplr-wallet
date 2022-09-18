import { computed, makeObservable } from "mobx";

import { DemoStore } from "./demo";
import { MultisigState, MultisigStore } from "./multisig";
import { SinglesigState, SinglesigStore } from "./singlesig";

export enum WalletType {
  MULTISIG,
  MULTISIG_DEMO,
  SINGLESIG,
}

export enum WalletState {
  LOADING,
  EMPTY,
  INITIALIZED,
}

export class WalletStore {
  protected demoStore: DemoStore;
  protected multisigStore: MultisigStore;
  protected singlesigStore: SinglesigStore;

  constructor({
    demoStore,
    multisigStore,
    singlesigStore,
  }: {
    demoStore: DemoStore;
    multisigStore: MultisigStore;
    singlesigStore: SinglesigStore;
  }) {
    this.demoStore = demoStore;
    this.multisigStore = multisigStore;
    this.singlesigStore = singlesigStore;
    makeObservable(this);
  }

  @computed
  public get state(): WalletState {
    if (
      !this.demoStore.demoMode &&
      this.multisigStore.state === MultisigState.LOADING &&
      this.singlesigStore.state === SinglesigState.LOADING
    ) {
      return WalletState.LOADING;
    }

    if (
      this.demoStore.demoMode ||
      this.multisigStore.state === MultisigState.INITIALIZED ||
      this.singlesigStore.state === SinglesigState.INITIALIZED
    ) {
      return WalletState.INITIALIZED;
    }

    return WalletState.EMPTY;
  }

  @computed
  public get type(): WalletType | null {
    if (this.state !== WalletState.INITIALIZED) return null;

    if (this.multisigStore.state === MultisigState.INITIALIZED) {
      return WalletType.MULTISIG;
    }

    if (this.singlesigStore.state === SinglesigState.INITIALIZED) {
      return WalletType.SINGLESIG;
    }

    return WalletType.MULTISIG_DEMO;
  }
}
