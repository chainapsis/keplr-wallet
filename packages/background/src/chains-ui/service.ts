import { ChainsService } from "../chains";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { computedFn } from "mobx-utils";
import { VaultService } from "../vault";

export class ChainsUIService {
  // Key: vault id
  @observable
  protected enabledChainIdentifiersMap = new Map<string, string[]>();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, string[]>>(
      "enabledChainIdentifiesMap"
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.enabledChainIdentifiersMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.enabledChainIdentifiersMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set("enabledChainIdentifiesMap", obj);
    });

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
    this.vaultService.addVaultRemovedHandler(this.onVaultRemoved);
  }

  readonly enabledChainIdentifiersForVault = computedFn(
    (vaultId: string): string[] => {
      const chainIdentifiers = (
        this.enabledChainIdentifiersMap.get(vaultId) ?? []
      ).filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });
      if (chainIdentifiers.length === 0) {
        // Should be enabled at least one chain.
        return [
          ChainIdHelper.parse(this.chainsService.getChainInfos()[0].chainId)
            .identifier,
        ];
      } else {
        return chainIdentifiers;
      }
    },
    {
      keepAlive: true,
    }
  );

  protected readonly enabledChainIdentifierMapForVault = computedFn(
    (vaultId: string): Map<string, boolean> => {
      const chainIdentifiers = this.enabledChainIdentifiersForVault(vaultId);

      const res = new Map<string, boolean>();
      for (const chainIdentifier of chainIdentifiers) {
        res.set(chainIdentifier, true);
      }
      return res;
    },
    {
      keepAlive: true,
    }
  );

  @action
  toggleChain(vaultId: string, ...chainIds: string[]) {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const paramChainIdentifiers = chainIds
      .map((chainId) => {
        return ChainIdHelper.parse(chainId).identifier;
      })
      .filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });

    const identifierMap = this.enabledChainIdentifierMapForVault(vaultId);

    for (const param of paramChainIdentifiers) {
      if (!identifierMap.get(param)) {
        this.enableChain(vaultId, param);
      } else {
        this.disableChain(vaultId, param);
      }
    }
  }

  @action
  enableChain(vaultId: string, ...chainIds: string[]) {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const paramChainIdentifiers = chainIds
      .map((chainId) => {
        return ChainIdHelper.parse(chainId).identifier;
      })
      .filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });

    const identifierMap = this.enabledChainIdentifierMapForVault(vaultId);

    for (const param of paramChainIdentifiers) {
      if (!identifierMap.get(param)) {
        const arr = this.enabledChainIdentifiersMap.get(vaultId) ?? [];
        arr.push(param);

        this.enabledChainIdentifiersMap.set(vaultId, arr);
      }
    }
  }

  @action
  disableChain(vaultId: string, ...chainIds: string[]) {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const paramChainIdentifiers = chainIds
      .map((chainId) => {
        return ChainIdHelper.parse(chainId).identifier;
      })
      .filter((chainIdentifier) => {
        return this.chainsService.hasChainInfo(chainIdentifier);
      });

    const identifierMap = this.enabledChainIdentifierMapForVault(vaultId);

    for (const param of paramChainIdentifiers) {
      if (identifierMap.get(param)) {
        const arr = this.enabledChainIdentifiersMap.get(vaultId) ?? [];
        const i = arr.findIndex((chainIdentifier) => chainIdentifier === param);
        if (i >= 0) {
          arr.splice(i, 1);
        }
        this.enabledChainIdentifiersMap.set(vaultId, arr);
      }
    }
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    runInAction(() => {
      const identifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
      const vaultIds = this.enabledChainIdentifiersMap.keys();
      for (const vaultId of vaultIds) {
        const map = this.enabledChainIdentifierMapForVault(vaultId);
        if (map.get(identifier)) {
          const arr = this.enabledChainIdentifiersMap.get(vaultId) ?? [];
          const i = arr.findIndex(
            (chainIdentifier) => chainIdentifier === identifier
          );
          arr.splice(i, 1);
          this.enabledChainIdentifiersMap.set(vaultId, arr);
        }
      }
    });
  };

  protected readonly onVaultRemoved = (type: string, id: string) => {
    runInAction(() => {
      if (type === "keyRing") {
        this.enabledChainIdentifiersMap.delete(id);
      }
    });
  };
}
