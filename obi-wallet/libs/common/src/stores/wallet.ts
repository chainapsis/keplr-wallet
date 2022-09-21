import { computed, makeObservable } from "mobx";

import { DemoStore } from "./demo";
import { MultisigState, MultisigStore } from "./multisig";
import { SinglesigState, SinglesigStore } from "./singlesig";

export enum WalletType {
  MULTISIG = "Multisig",
  MULTISIG_DEMO = "MultisigDemo",
  MULTISIG_PENDING = "MultisigPending",
  SINGLESIG = "Singlesig",
}

export enum WalletState {
  LOADING = "Loading",
  EMPTY = "Empty",
  INITIALIZED = "Initialized",
}

export class WalletStore {
  protected readonly demoStore: DemoStore;
  protected readonly multisigStore: MultisigStore;
  protected readonly pendingMultisigStore: MultisigStore;
  protected readonly singlesigStore: SinglesigStore;

  constructor({
    demoStore,
    multisigStore,
    pendingMultisigStore,
    singlesigStore,
  }: {
    demoStore: DemoStore;
    multisigStore: MultisigStore;
    pendingMultisigStore: MultisigStore;
    singlesigStore: SinglesigStore;
  }) {
    this.demoStore = demoStore;
    this.multisigStore = multisigStore;
    this.pendingMultisigStore = pendingMultisigStore;
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
      this.demoStore.demoState === MultisigState.INITIALIZED ||
      this.multisigStore.state === MultisigState.INITIALIZED ||
      this.singlesigStore.state === SinglesigState.INITIALIZED
    ) {
      return WalletState.INITIALIZED;
    }

    return WalletState.EMPTY;
  }

  @computed
  public get type(): WalletType | null {
    if (this.state === WalletState.LOADING) return null;

    if (this.singlesigStore.state === SinglesigState.INITIALIZED) {
      return WalletType.SINGLESIG;
    }

    return this.demoStore.demoMode
      ? WalletType.MULTISIG_DEMO
      : WalletType.MULTISIG;
  }

  @computed
  public get address(): string | null {
    if (this.type === null) return null;

    switch (this.type) {
      case WalletType.MULTISIG:
        return this.multisigStore.proxyAddress?.address ?? null;
      case WalletType.MULTISIG_DEMO:
        return null;
      case WalletType.MULTISIG_PENDING:
        return this.pendingMultisigStore.proxyAddress?.address ?? null;
      case WalletType.SINGLESIG:
        return this.singlesigStore.address;
    }
  }
}
