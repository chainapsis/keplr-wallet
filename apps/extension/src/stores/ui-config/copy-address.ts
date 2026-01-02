import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { ChainStore } from "../chain";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { computedFn } from "mobx-utils";

export class CopyAddressConfig {
  protected readonly kvStore: KVStore;

  // Key: vault id, value: array of chain identifiers
  @observable
  protected readonly vaultToConfigMap = new Map<string, string[]>();

  constructor(kvStore: KVStore, protected readonly chainStore: ChainStore) {
    this.kvStore = new PrefixKVStore(kvStore, "copy-address");

    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, string[]>>(
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
      this.kvStore.set<Record<string, string[]>>("vault-to-config-map", obj);
    });

    await this.chainStore.waitUntilInitialized();

    // Sync and clear the config if the chain is removed.
    autorun(() => {
      const chainIdentifierMap = new Map<string, boolean>();
      for (const chainInfo of this.chainStore.modularChainInfos) {
        chainIdentifierMap.set(
          ChainIdHelper.parse(chainInfo.chainId).identifier,
          true
        );
      }

      runInAction(() => {
        for (const [_, chainIdentifiers] of this.vaultToConfigMap) {
          for (let i = 0; i < chainIdentifiers.length; i++) {
            const chainIdentifier = chainIdentifiers[i];
            if (!chainIdentifierMap.has(chainIdentifier)) {
              chainIdentifiers.splice(i, 1);
              i--;
            }
          }
        }
      });
    });

    // Sync and clear the config if the chain is hidden.
    autorun(() => {
      const chainIdentifierMap = new Map<string, boolean>();
      for (const chainInfo of this.chainStore.modularChainInfosInUI) {
        chainIdentifierMap.set(
          ChainIdHelper.parse(chainInfo.chainId).identifier,
          true
        );
      }

      // 이 로직이 위에 로직보다 밑에 있어야함.
      // this.chainStore.chainInfosInUI가 observed되는 걸 명확하게 하기 위해서임.
      if (!this.chainStore.isEnabledChainsSynced) {
        return;
      }

      runInAction(() => {
        const chainIdentifiers = this.vaultToConfigMap.get(
          this.chainStore.lastSyncedEnabledChainsVaultId
        );
        if (chainIdentifiers) {
          for (let i = 0; i < chainIdentifiers.length; i++) {
            const chainIdentifier = chainIdentifiers[i];
            if (!chainIdentifierMap.has(chainIdentifier)) {
              chainIdentifiers.splice(i, 1);
              i--;
            }
          }
        }
      });
    });
  }

  isBookmarkedChain = computedFn(
    (vaultId: string, chainId: string): boolean => {
      const chainIdentifiers = this.vaultToConfigMap.get(vaultId);
      if (!chainIdentifiers) {
        return false;
      }
      return chainIdentifiers.includes(ChainIdHelper.parse(chainId).identifier);
    }
  );

  bookmarkChain(vaultId: string, chainId: string): void {
    const chainIdentifiers = this.vaultToConfigMap.get(vaultId);
    if (!chainIdentifiers) {
      this.vaultToConfigMap.set(vaultId, [
        ChainIdHelper.parse(chainId).identifier,
      ]);
      return;
    }
    if (!chainIdentifiers.includes(ChainIdHelper.parse(chainId).identifier)) {
      chainIdentifiers.push(ChainIdHelper.parse(chainId).identifier);
    }
  }

  unbookmarkChain(vaultId: string, chainId: string): void {
    const chainIdentifiers = this.vaultToConfigMap.get(vaultId);
    if (!chainIdentifiers) {
      return;
    }
    const index = chainIdentifiers.indexOf(
      ChainIdHelper.parse(chainId).identifier
    );
    if (index >= 0) {
      chainIdentifiers.splice(index, 1);
    }
  }
}
