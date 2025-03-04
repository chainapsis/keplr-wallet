import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { KeyRingStore } from "@keplr-wallet/stores-core";
import { ChainStore } from "../chain";

export class NeedToShowGuideModalConfig {
  protected readonly kvStore: KVStore;

  @observable
  protected readonly vaultToConfigMap = new Map<string, boolean>();

  constructor(
    kvStore: KVStore,
    protected readonly keyRingStore: KeyRingStore,
    protected readonly chainStore: ChainStore
  ) {
    makeObservable(this);
    this.kvStore = new PrefixKVStore(kvStore, "need-to-show-guide-modal");
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, boolean>>(
      "vault-to-config-map"
    );

    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.vaultToConfigMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.vaultToConfigMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, boolean>>("vault-to-config-map", obj);
    });
  }

  setNeedToShowStarknetGuideModal(value: boolean) {
    this.vaultToConfigMap.set(
      this.keyRingStore.selectedKeyInfo?.id ?? "",
      value
    );
  }

  get isNeedToShowStarknetGuideModal(): boolean {
    return (
      this.vaultToConfigMap.get(this.keyRingStore.selectedKeyInfo?.id ?? "") ??
      false
    );
  }
}
