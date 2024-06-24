import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { computedFn } from "mobx-utils";

export class SelectWalletConfig {
  protected readonly kvStore: KVStore;

  @observable
  protected readonly keyToSortVaultIdsMap = new Map<string, string[]>();

  constructor(kvStore: KVStore) {
    this.kvStore = new PrefixKVStore(kvStore, "select-wallet");

    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, string[]>>(
      "keyToSortVaultIdsMap"
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.keyToSortVaultIdsMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.keyToSortVaultIdsMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, string[]>>("keyToSortVaultIdsMap", obj);
    });
  }

  getKeyToSortVaultIds(key: string): string[] {
    return this.keyToSortVaultIdsMap.get(key) || [];
  }

  getKeyToSortVaultIdsMapIndex = computedFn(
    (key: string): Map<string, number> => {
      const ids = this.getKeyToSortVaultIds(key);
      const map = new Map<string, number>();
      for (let i = 0; i < ids.length; i++) {
        map.set(ids[i], i);
      }
      return map;
    }
  );

  setKeyToSortVaultIds(key: string, vaultIds: string[]): void {
    runInAction(() => {
      this.keyToSortVaultIdsMap.set(key, vaultIds);
    });
  }
}
