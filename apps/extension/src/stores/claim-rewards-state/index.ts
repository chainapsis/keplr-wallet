import { action, makeObservable, observable } from "mobx";
import { ChainStore } from "../chain";
import { KeyRingStore } from "@keplr-wallet/stores-core";

export class ClaimAllEachState {
  @observable
  isLoading = false;

  @observable
  isSimulating = false;

  @observable
  failedReason: Error | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsLoading(value: boolean) {
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
}

export class ClaimRewardsStateStore {
  private readonly map = new Map<string, ClaimAllEachState>();

  constructor(
    private readonly chainStore: ChainStore,
    private readonly keyRingStore: KeyRingStore
  ) {}

  private key(chainId: string) {
    const chainIdentifier = this.chainStore.hasChain(chainId)
      ? this.chainStore.getChain(chainId).chainIdentifier
      : chainId;
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
        this.map.delete(mapKey);
      }
    }
  }

  resetAll() {
    this.map.clear();
  }
}
