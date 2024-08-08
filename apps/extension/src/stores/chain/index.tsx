import {
  autorun,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

import { ChainInfo } from "@keplr-wallet/types";
import {
  ChainStore as BaseChainStore,
  IChainInfoImpl,
} from "@keplr-wallet/stores";
import { KeyRingStore } from "@keplr-wallet/stores-core";

import {
  ChainInfoWithCoreTypes,
  ClearAllChainEndpointsMsg,
  ClearAllSuggestedChainInfosMsg,
  ClearChainEndpointsMsg,
  DisableChainsMsg,
  EnableChainsMsg,
  EnableVaultsWithCosmosAddressMsg,
  GetChainInfosWithCoreTypesMsg,
  GetEnabledChainIdentifiersMsg,
  GetTokenScansMsg,
  RemoveSuggestedChainInfoMsg,
  RevalidateTokenScansMsg,
  SetChainEndpointsMsg,
  ToggleChainsMsg,
  TokenScan,
  TryUpdateEnabledChainInfosMsg,
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

  @observable.ref
  protected _tokenScans: TokenScan[] = [];

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
  get tokenScans(): TokenScan[] {
    return this._tokenScans.filter((scan) => {
      if (!this.hasChain(scan.chainId)) {
        return false;
      }

      const chainIdentifier = ChainIdHelper.parse(scan.chainId).identifier;
      return !this.enabledChainIdentifiesMap.get(chainIdentifier);
    });
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
      if (chainInfo.hideInUI) {
        return false;
      }
      const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
      return this.enabledChainIdentifiesMap.get(chainIdentifier);
    });
  }

  // chain info들을 list로 보여줄때 hideInUI인 얘들은 빼고 보여줘야한다
  // property 이름이 얘매해서 일단 이렇게 지었다.
  @computed
  get chainInfosInListUI() {
    return this.chainInfos.filter((chainInfo) => {
      return !chainInfo.hideInUI;
    });
  }

  isEnabledChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    return this.enabledChainIdentifiesMap.get(chainIdentifier) === true;
  }

  @computed
  protected get chainInfosInListUIMap(): Map<string, true> {
    const map = new Map<string, true>();
    for (const chainInfo of this.chainInfosInListUI) {
      map.set(chainInfo.chainIdentifier, true);
    }
    return map;
  }

  isInChainInfosInListUI(chainId: string): boolean {
    return (
      this.chainInfosInListUIMap.get(
        ChainIdHelper.parse(chainId).identifier
      ) === true
    );
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
  *enableChainInfoInUIWithVaultId(vaultId: string, ...chainIds: string[]) {
    const msg = new EnableChainsMsg(vaultId, chainIds);
    const enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    if (this.keyRingStore.selectedKeyInfo?.id === vaultId) {
      this._enabledChainIdentifiers = enabledChainIdentifiers;
    }
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
  *disableChainInfoInUIWithVaultId(vaultId: string, ...chainIds: string[]) {
    const msg = new DisableChainsMsg(vaultId, chainIds);
    const enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    if (this.keyRingStore.selectedKeyInfo?.id === vaultId) {
      this._enabledChainIdentifiers = enabledChainIdentifiers;
    }
  }

  @flow
  protected *init() {
    this._isInitializing = true;

    yield this.keyRingStore.waitUntilInitialized();

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

    // Must not wait!!
    this.tryUpdateEnabledChainInfos();
  }

  async tryUpdateEnabledChainInfos(): Promise<void> {
    const msg = new TryUpdateEnabledChainInfosMsg();
    const updated = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    if (updated) {
      await this.updateChainInfosFromBackground();
    }
  }

  @flow
  *updateChainInfosFromBackground() {
    const msg = new GetChainInfosWithCoreTypesMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.setEmbeddedChainInfos(result.chainInfos);
  }

  @flow
  *enableVaultsWithCosmosAddress(chainId: string, bech32Address: string) {
    const msg = new EnableVaultsWithCosmosAddressMsg(chainId, bech32Address);
    const res = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    const changed = res.find(
      (r) => r.vaultId === this.keyRingStore.selectedKeyInfo?.id
    );
    if (changed) {
      this._enabledChainIdentifiers = changed.newEnabledChains as string[];
    }
  }

  @flow
  *updateEnabledChainIdentifiersFromBackground() {
    if (!this.keyRingStore.selectedKeyInfo) {
      this._lastSyncedEnabledChainsVaultId = "";
      return;
    }

    if (
      this._lastSyncedEnabledChainsVaultId ===
      this.keyRingStore.selectedKeyInfo.id
    ) {
      return;
    }

    const id = this.keyRingStore.selectedKeyInfo.id;
    const msg = new GetEnabledChainIdentifiersMsg(id);
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this._tokenScans = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, new GetTokenScansMsg(id))
    );
    (async () => {
      await new Promise<void>((resolve) => {
        const disposal = autorun(() => {
          if (this.keyRingStore.status === "unlocked") {
            resolve();

            if (disposal) {
              disposal();
            }
          }
        });
      });

      const res = await this.requester.sendMessage(
        BACKGROUND_PORT,
        new RevalidateTokenScansMsg(id)
      );
      if (res.vaultId === this.keyRingStore.selectedKeyInfo?.id) {
        runInAction(() => {
          this._tokenScans = res.tokenScans;
        });
      }
    })();

    this._lastSyncedEnabledChainsVaultId = id;
  }

  // Enabled chains depends on the selected key info.
  // This process is automatically done when the selected key info is changed. (see init())
  // But, if you want to wait until the enabled chains are synced, you can use this getter.
  @computed
  get isEnabledChainsSynced(): boolean {
    return !!(
      this.keyRingStore.selectedKeyInfo &&
      this.keyRingStore.selectedKeyInfo.id ===
        this._lastSyncedEnabledChainsVaultId
    );
  }

  get lastSyncedEnabledChainsVaultId(): string {
    return this._lastSyncedEnabledChainsVaultId;
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
  *setChainEndpoints(
    chainId: string,
    rpc: string | undefined,
    rest: string | undefined,
    evmRpc: string | undefined
  ) {
    const msg = new SetChainEndpointsMsg(chainId, rpc, rest, evmRpc);
    const newChainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setEmbeddedChainInfos(newChainInfos);
  }

  @flow
  *resetChainEndpoints(chainId: string) {
    const msg = new ClearChainEndpointsMsg(chainId);
    const newChainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setEmbeddedChainInfos(newChainInfos);
  }

  // I use Async, Await because it doesn't change the state value.
  async clearClearAllSuggestedChainInfos() {
    const msg = new ClearAllSuggestedChainInfosMsg();
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  // I use Async, Await because it doesn't change the state value.
  async clearAllChainEndpoints() {
    const msg = new ClearAllChainEndpointsMsg();
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}
