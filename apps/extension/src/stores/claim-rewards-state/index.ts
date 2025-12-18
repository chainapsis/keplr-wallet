import { action, makeObservable, observable, computed } from "mobx";
import { KeyRingStore } from "@keplr-wallet/stores-core";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class ClaimAllEachState {
  @observable
  isLoading = false;

  @observable
  isSimulating = false;

  @observable
  failedReason: Error | undefined = undefined;

  @observable
  hasStarted = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsLoading(value: boolean) {
    if (value) {
      this.hasStarted = true;
    }
    this.isLoading = value;
  }

  @action
  setIsSimulating(value: boolean) {
    this.isSimulating = value;
  }

  @action
  setFailedReason(value: Error | undefined) {
    this.isLoading = false;
    this.failedReason = value;
  }

  @action
  reset() {
    this.isLoading = false;
    this.isSimulating = false;
    this.failedReason = undefined;
    this.hasStarted = false;
  }

  @computed
  get isCompleted() {
    return this.hasStarted && !this.isLoading && !this.isSimulating;
  }

  @computed
  get isSucceeded() {
    return this.isCompleted && !this.failedReason;
  }
}

export class ClaimRewardsStateStore {
  private readonly map = new Map<string, ClaimAllEachState>();

  constructor(
    private readonly keyRingStore: KeyRingStore,
    private readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
    }
  ) {
    this.eventListener.addEventListener("keplr_keystorechange", () => {
      this.resetAll();
    });
  }

  private key(chainId: string) {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const keyId = this.keyRingStore.selectedKeyInfo?.id ?? "unknown";
    return `${keyId}:${chainIdentifier}`;
  }

  get(chainId: string) {
    const mapKey = this.key(chainId);
    let state = this.map.get(mapKey);
    if (!state) {
      state = new ClaimAllEachState();
      this.map.set(mapKey, state);
    }
    return state;
  }

  values() {
    return this.map.values();
  }

  resetForKey(keyId: string | undefined) {
    if (!keyId) {
      return;
    }
    for (const mapKey of Array.from(this.map.keys())) {
      if (mapKey.startsWith(`${keyId}:`)) {
        const state = this.map.get(mapKey);
        if (state) {
          state.reset();
        }
        this.map.delete(mapKey);
      }
    }
  }

  resetAll() {
    for (const state of this.map.values()) {
      state.reset();
    }
    this.map.clear();
  }
}
