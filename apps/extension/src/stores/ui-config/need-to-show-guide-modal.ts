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

  get needToShowStarknetGuideModal() {
    return this.vaultToConfigMap.get(
      this.keyRingStore.selectedKeyInfo?.id ?? ""
    );
  }

  enableNeedToShowStarknetGuideModal() {
    const prev = this.vaultToConfigMap.get(
      this.keyRingStore.selectedKeyInfo?.id ?? ""
    );

    if (prev === undefined) {
      this.vaultToConfigMap.set(
        this.keyRingStore.selectedKeyInfo?.id ?? "",
        true
      );
    }
  }

  disableNeedToShowStarknetGuideModal() {
    this.vaultToConfigMap.set(
      this.keyRingStore.selectedKeyInfo?.id ?? "",
      false
    );
  }

  removeNeedToShowStarknetGuideModal() {
    this.vaultToConfigMap.delete(this.keyRingStore.selectedKeyInfo?.id ?? "");
  }

  get isNeedToShowStarknetGuideModal(): boolean {
    return (
      this.vaultToConfigMap.get(this.keyRingStore.selectedKeyInfo?.id ?? "") ??
      false
    );
  }
}

//해제하고 이후 다시 설정하면 이게 적용이 되야함.
//그런데 enable 할때 마다 그러면 안됨 흠
// 그러면 없으면 false
