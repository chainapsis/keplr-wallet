import { autorun, computed, flow, makeObservable, observable } from "mobx";

import {
  ChainStore as BaseChainStore,
  IChainInfoImpl,
  KeyRingStore,
} from "@keplr-wallet/stores";

import { ChainInfo } from "@keplr-wallet/types";
import {
  ChainInfoWithCoreTypes,
  DisableChainsMsg,
  EnableChainsMsg,
  GetChainInfosWithCoreTypesMsg,
  GetEnabledChainIdentifiersMsg,
  RemoveSuggestedChainInfoMsg,
  ToggleChainsMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { toGenerator } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class ChainStore extends BaseChainStore<ChainInfoWithCoreTypes> {
  @observable
  protected _isInitializing: boolean = false;

  @observable
  protected _lastSyncedEnabledChainsVaultId: string = "";
  @observable.ref
  protected _enabledChainIdentifiers: string[] = [];

  constructor(
    protected readonly embedChainInfos: ChainInfo[],
    protected readonly keyRingStore: KeyRingStore,
    protected readonly requester: MessageRequester
  ) {
    super(
      embedChainInfos.map((chainInfo) => {
        return {
          ...chainInfo,
          ...{
            embedded: true,
          },
        };
      })
    );

    // Should be enabled at least one chain.
    this._enabledChainIdentifiers = [
      ChainIdHelper.parse(embedChainInfos[0].chainId).identifier,
    ];

    makeObservable(this);

    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  async waitUntilInitialized(): Promise<void> {
    if (!this.isInitializing) {
      return;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (!this.isInitializing) {
          resolve();

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  @computed
  protected get enabledChainIdentifiesMap(): Map<string, true> {
    if (this._enabledChainIdentifiers.length === 0) {
      // Should be enabled at least one chain.
      const map = new Map<string, true>();
      map.set(
        ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier,
        true
      );
      return map;
    }

    const map = new Map<string, true>();
    for (const chainIdentifier of this._enabledChainIdentifiers) {
      map.set(chainIdentifier, true);
    }
    return map;
  }

  @computed
  override get chainInfos(): IChainInfoImpl<ChainInfoWithCoreTypes>[] {
    // Sort by chain name.
    // The first chain has priority to be the first.
    return super.chainInfos.sort((a, b) => {
      const aChainIdentifier = ChainIdHelper.parse(a.chainId).identifier;
      const bChainIdentifier = ChainIdHelper.parse(b.chainId).identifier;

      if (
        aChainIdentifier ===
        ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier
      ) {
        return -1;
      }
      if (
        bChainIdentifier ===
        ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier
      ) {
        return 1;
      }

      return a.chainName.trim().localeCompare(b.chainName.trim());
    });
  }

  get enabledChainIdentifiers(): string[] {
    return this._enabledChainIdentifiers;
  }

  @computed
  get chainInfosInUI() {
    return this.chainInfos.filter((chainInfo) => {
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
      return this.enabledChainIdentifiesMap.get(chainIdentifier);
    });
  }

  isEnabledChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    return this.enabledChainIdentifiesMap.get(chainIdentifier) === true;
  }

  @flow
  *toggleChainInfoInUI(...chainIds: string[]) {
    if (!this.keyRingStore.selectedKeyInfo) {
      return;
    }

    const msg = new ToggleChainsMsg(
      this.keyRingStore.selectedKeyInfo.id,
      chainIds
    );
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
  }

  @flow
  *enableChainInfoInUI(...chainIds: string[]) {
    if (!this.keyRingStore.selectedKeyInfo) {
      return;
    }

    const msg = new EnableChainsMsg(
      this.keyRingStore.selectedKeyInfo.id,
      chainIds
    );
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
  }

  @flow
  *disableChainInfoInUI(...chainIds: string[]) {
    if (!this.keyRingStore.selectedKeyInfo) {
      return;
    }

    const msg = new DisableChainsMsg(
      this.keyRingStore.selectedKeyInfo.id,
      chainIds
    );
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
  }

  @flow
  protected *init() {
    this._isInitializing = true;

    yield Promise.all([
      this.updateChainInfosFromBackground(),
      this.updateEnabledChainIdentifiersFromBackground(),
    ]);

    autorun(() => {
      // Change the enabled chain identifiers when the selected key info is changed.
      if (this.keyRingStore.selectedKeyInfo) {
        this.updateEnabledChainIdentifiersFromBackground();
      }
    });

    this._isInitializing = false;
  }

  @flow
  protected *updateChainInfosFromBackground() {
    const msg = new GetChainInfosWithCoreTypesMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.setEmbeddedChainInfos(result.chainInfos);
  }

  @flow
  protected *updateEnabledChainIdentifiersFromBackground() {
    if (!this.keyRingStore.selectedKeyInfo) {
      this._lastSyncedEnabledChainsVaultId = "";
      return;
    }

    const id = this.keyRingStore.selectedKeyInfo.id;
    const msg = new GetEnabledChainIdentifiersMsg(id);
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._lastSyncedEnabledChainsVaultId = id;
  }

  // Enabled chains depends on the selected key info.
  // This process is automatically done when the selected key info is changed. (see init())
  // But, if you want to wait until the enabled chains are synced, you can use this method.
  async waitSyncedEnabledChains(): Promise<void> {
    if (
      this.keyRingStore.selectedKeyInfo &&
      this.keyRingStore.selectedKeyInfo.id ===
        this._lastSyncedEnabledChainsVaultId
    ) {
      return;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (
          this.keyRingStore.selectedKeyInfo &&
          this.keyRingStore.selectedKeyInfo.id ===
            this._lastSyncedEnabledChainsVaultId
        ) {
          resolve();

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  @flow
  *removeChainInfo(chainId: string) {
    const msg = new RemoveSuggestedChainInfoMsg(chainId);
    const chainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setEmbeddedChainInfos(chainInfos);
  }

  @flow
  *tryUpdateChain(_chainId: string) {
    // const msg = new TryUpdateChainMsg(chainId);
    // const result = yield* toGenerator(
    //   this.requester.sendMessage(BACKGROUND_PORT, msg)
    // );
    // if (result.updated) {
    //   yield this.getChainInfosFromBackground();
    // }
    throw new Error("TODO");
  }

  @flow
  *setChainEndpoints(
    _chainId: string,
    _rpc: string | undefined,
    _rest: string | undefined
  ) {
    // const msg = new SetChainEndpointsMsg(chainId, rpc, rest);
    // const newChainInfos = yield* toGenerator(
    //   this.requester.sendMessage(BACKGROUND_PORT, msg)
    // );
    //
    // this.setChainInfos(newChainInfos);

    throw new Error("TODO");

    // ObservableQuery.refreshAllObserved();
  }

  @flow
  *resetChainEndpoints(_chainId: string) {
    // const msg = new ResetChainEndpointsMsg(chainId);
    // const newChainInfos = yield* toGenerator(
    //   this.requester.sendMessage(BACKGROUND_PORT, msg)
    // );
    //
    // this.setChainInfos(newChainInfos);

    throw new Error("TODO");

    // ObservableQuery.refreshAllObserved();
  }
}
