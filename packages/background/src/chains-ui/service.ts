import { ChainInfoWithCoreTypes, ChainsService } from "../chains";
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class ChainsUIService {
  @observable.ref
  protected _enabledChainIdentifies: ReadonlyArray<string> = [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<string[]>("enabledChainIdentifies");
    if (saved && saved.length > 0) {
      runInAction(() => {
        this._enabledChainIdentifies = saved;
      });
    } else {
      this._enabledChainIdentifies = [
        ChainIdHelper.parse(this.chainsService.getChainInfos()[0].chainId)
          .identifier,
      ];
    }
    autorun(() => {
      this.kvStore.set("enabledChainIdentifies", this._enabledChainIdentifies);
    });

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  @action
  toggleChain(...chainIds: string[]) {
    for (const chainId of chainIds) {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      if (this.enabledChainIdentifiesMap.get(identifier)) {
        this.disableChain(chainId);
      } else {
        this.enableChain(chainId);
      }
    }
  }

  @action
  enableChain(...chainIds: string[]) {
    for (const chainId of chainIds) {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      if (!this.enabledChainIdentifiesMap.get(identifier)) {
        this.chainsService.getChainInfoOrThrow(chainId);

        this._enabledChainIdentifies =
          this._enabledChainIdentifies.concat(identifier);
      }
    }
  }

  @action
  disableChain(...chainIds: string[]) {
    for (const chainId of chainIds) {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      if (this.enabledChainIdentifiesMap.get(identifier)) {
        this._enabledChainIdentifies = this._enabledChainIdentifies.filter(
          (chainIdentifier) => chainIdentifier !== identifier
        );
      }
    }
  }

  @computed({
    keepAlive: true,
  })
  get enabledChainIdentifies(): string[] {
    return this._enabledChainIdentifies.slice().filter((chainIdentifier) => {
      return this.chainsService.hasChainInfo(chainIdentifier);
    });
  }

  @computed({
    keepAlive: true,
  })
  get enabledChainInfos(): ChainInfoWithCoreTypes[] {
    return this.chainsService
      .getChainInfosWithCoreTypes()
      .filter((chainInfo) => {
        return this.enabledChainIdentifiesMap.get(
          ChainIdHelper.parse(chainInfo.chainId).identifier
        );
      });
  }

  @computed({
    keepAlive: true,
  })
  protected get enabledChainIdentifiesMap(): Map<string, true> {
    const map = new Map<string, true>();
    for (const chainIdentifier of this.enabledChainIdentifies) {
      map.set(chainIdentifier, true);
    }
    return map;
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    const identifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
    if (this.enabledChainIdentifiesMap.get(identifier)) {
      runInAction(() => {
        this._enabledChainIdentifies = this._enabledChainIdentifies.filter(
          (chainIdentifier) => chainIdentifier !== identifier
        );
      });
    }
  };
}
