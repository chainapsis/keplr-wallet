import {
  autorun,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

import { AppCurrency, ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
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
  SyncTokenScanInfosMsg,
  ToggleChainsMsg,
  TokenScan,
  TokenScanInfo,
  TryUpdateAllChainInfosMsg,
  TryUpdateEnabledChainInfosMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

type Assets = {
  currency: AppCurrency;
  amount: string;
};

export class ChainStore extends BaseChainStore<ChainInfoWithCoreTypes> {
  @observable
  protected _isInitializing: boolean = false;

  @observable
  protected _lastSyncedEnabledChainsVaultId: string = "";
  @observable.ref
  protected _enabledChainIdentifiers: string[] = [];

  @observable.ref
  protected _tokenScans: TokenScan[] = [];

  @observable
  protected _lastTokenScanRevalidateTimestamp: Map<string, number> = new Map();

  @observable
  protected _newTokenFoundDismissed: Map<string, boolean> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly embedChainInfos: (ModularChainInfo | ChainInfo)[],
    protected readonly keyRingStore: KeyRingStore,
    protected readonly requester: MessageRequester,
    protected readonly updateAllChainInfo: boolean
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
    const resolveCurrency = (
      chainId: string,
      denom: string
    ): AppCurrency | undefined => {
      const chainInfo = this.hasChain(chainId) ? this.getChain(chainId) : null;
      const modularChainInfo = this.hasModularChain(chainId)
        ? this.getModularChain(chainId)
        : null;

      const currencies: AppCurrency[] = (() => {
        if (chainInfo) return chainInfo.currencies;
        if (modularChainInfo) {
          if ("cosmos" in modularChainInfo) {
            return modularChainInfo.cosmos.currencies;
          }

          if ("bitcoin" in modularChainInfo) {
            return modularChainInfo.bitcoin.currencies;
          }

          if ("starknet" in modularChainInfo) {
            return modularChainInfo.starknet.currencies;
          }
        }
        return [];
      })();

      if (chainInfo) {
        const found = chainInfo.forceFindCurrency(denom);
        if (!found.coinDenom.startsWith("ibc/")) {
          return found;
        }
      }

      if (modularChainInfo) {
        const found = currencies.find((cur) => cur.coinMinimalDenom === denom);
        if (found) {
          return found;
        }
      }

      return undefined;
    };

    return this._tokenScans
      .filter((scan) => {
        if (
          !this.hasChain(scan.chainId) &&
          !this.hasModularChain(scan.chainId)
        ) {
          return false;
        }

        const chainIdentifier = ChainIdHelper.parse(scan.chainId).identifier;
        return !this.enabledChainIdentifiesMap.get(chainIdentifier);
      })
      .map((scan) => {
        const newInfos = scan.infos.map((info) => {
          const newAssets = info.assets
            .map((asset) => {
              const cur = resolveCurrency(
                scan.chainId,
                asset.currency.coinMinimalDenom
              );
              if (!cur) return undefined;
              return {
                ...asset,
                currency: cur,
              };
            })
            .filter((a): a is Assets => !!a);

          return {
            ...info,
            assets: newAssets,
          };
        });

        return {
          ...scan,
          infos: newInfos,
        };
      });
  }

  @computed
  get shouldShowNewTokenFoundInMain(): boolean {
    const vaultId = this.keyRingStore.selectedKeyInfo?.id;
    if (!vaultId) {
      return false;
    }

    const dismissed = this._newTokenFoundDismissed.get(vaultId) ?? false;
    if (dismissed) {
      return false;
    }

    return this.tokenScans.length > 0;
  }

  dismissNewTokenFoundInHome() {
    const vaultId = this.keyRingStore.selectedKeyInfo?.id;
    if (!vaultId) {
      return;
    }

    runInAction(() => {
      this._newTokenFoundDismissed.set(vaultId, true);
    });

    // Sync prevInfos to current infos in background so future scans
    // compare against the state at dismiss time
    this.requester.sendMessage(
      BACKGROUND_PORT,
      new SyncTokenScanInfosMsg(vaultId)
    );
  }

  protected resetDismissIfNeeded(vaultId: string, tokenScans: TokenScan[]) {
    const needReset = tokenScans.some((scan) =>
      this.isMeaningfulTokenScanChange(scan)
    );

    if (needReset) {
      runInAction(() => {
        this._newTokenFoundDismissed.set(vaultId, false);
      });
    }
  }

  protected isMeaningfulTokenScanChange(tokenScan: TokenScan): boolean {
    if (!tokenScan.prevInfos || tokenScan.prevInfos.length === 0) {
      return tokenScan.infos.length > 0;
    }

    const makeKey = (info: TokenScanInfo): string | undefined => {
      if (info.bech32Address) return `bech32:${info.bech32Address}`;
      if (info.ethereumHexAddress) return `eth:${info.ethereumHexAddress}`;
      if (info.starknetHexAddress) return `stark:${info.starknetHexAddress}`;
      if (info.bitcoinAddress?.bech32Address)
        return `btc:${info.bitcoinAddress.bech32Address}`;
      if (info.coinType != null) return `coin:${info.coinType}`;
      return undefined;
    };

    const toBigIntSafe = (v: string): bigint | undefined => {
      try {
        return BigInt(v);
      } catch {
        return undefined;
      }
    };

    const prevTokenInfosMap = new Map<string, TokenScanInfo>();
    for (const info of tokenScan.prevInfos ?? []) {
      const key = makeKey(info);
      if (key) {
        prevTokenInfosMap.set(key, info);
      }
    }

    for (const info of tokenScan.infos) {
      const key = makeKey(info);
      if (!key) {
        continue;
      }

      const prevTokenInfo = prevTokenInfosMap.get(key);

      if (!prevTokenInfo) {
        if (info.assets.length > 0) {
          return true;
        }
        continue;
      }

      const prevAssetMap = new Map<string, Assets>();
      for (const asset of prevTokenInfo.assets) {
        prevAssetMap.set(asset.currency.coinMinimalDenom, asset);
      }

      for (const asset of info.assets) {
        const prevAsset = prevAssetMap.get(asset.currency.coinMinimalDenom);

        // 없던 토큰이 생긴경우
        if (!prevAsset) {
          return true;
        }

        const prevAmount = toBigIntSafe(prevAsset.amount);
        const curAmount = toBigIntSafe(asset.amount);
        if (prevAmount == null || curAmount == null) {
          continue;
        }

        // 이전에 0이였다가 밸런스가 생긴경우.
        if (prevAmount === BigInt(0) && curAmount > BigInt(0)) {
          return true;
        }

        // 이전 밸런스에 배해서 10% 밸런스가 증가한 경우
        if (
          prevAmount > BigInt(0) &&
          curAmount * BigInt(10) >= prevAmount * BigInt(11)
        ) {
          return true;
        }
      }
    }

    return false;
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

  @computed
  override get modularChainInfos(): ModularChainInfo[] {
    // Sort by chain name.
    // The first chain has priority to be the first.
    return super.modularChainInfos.sort((a, b) => {
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

  /**
   * Group modular chain infos by linked chain ids.
   * For example, bitcoin has separated chain for native segwit and taproot,
   * but they have to be shown as a same chain in some cases.
   *
   * @returns Grouped modular chain infos.
   */
  @computed
  get groupedModularChainInfos(): (ModularChainInfo & {
    linkedModularChainInfos?: ModularChainInfo[];
  })[] {
    const linkedChainInfosByChainKey = new Map<string, ModularChainInfo[]>();
    const groupedModularChainInfos: (ModularChainInfo & {
      linkedModularChainInfos?: ModularChainInfo[];
    })[] = [];

    for (const modularChainInfo of this.modularChainInfos) {
      if ("linkedChainKey" in modularChainInfo) {
        const linkedChainKey = modularChainInfo.linkedChainKey;
        const linkedChainInfos = linkedChainInfosByChainKey.get(linkedChainKey);
        if (linkedChainInfos) {
          linkedChainInfos.push(modularChainInfo);
        } else {
          linkedChainInfosByChainKey.set(linkedChainKey, [modularChainInfo]);
        }
      } else {
        groupedModularChainInfos.push(modularChainInfo);
      }
    }

    for (const linkedChainInfos of linkedChainInfosByChainKey.values()) {
      // 하나의 체인 키에 여러개의 체인이 연결되어 있으면 하나의 체인만 남기고 나머지는 버린다
      // CHECK: 어떤 것이 primary 체인인지 결정할 필요가 있는지? 우선 첫번째 체인을 primary로 설정
      if (linkedChainInfos.length > 1) {
        groupedModularChainInfos.push({
          ...linkedChainInfos[0],
          linkedModularChainInfos: linkedChainInfos.slice(1),
        });
      }
    }

    return groupedModularChainInfos;
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

  @computed
  get modularChainInfosInUI() {
    return this.modularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }
      const chainIdentifier = ChainIdHelper.parse(
        modularChainInfo.chainId
      ).identifier;

      return this.enabledChainIdentifiesMap.get(chainIdentifier);
    });
  }

  @computed
  get groupedModularChainInfosInUI() {
    return this.groupedModularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }

      const chainIdentifier = ChainIdHelper.parse(
        modularChainInfo.chainId
      ).identifier;

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

  @computed
  get modularChainInfosInListUI() {
    return this.modularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }

      return true;
    });
  }

  @computed
  get groupedModularChainInfosInListUI() {
    return this.groupedModularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }

      return true;
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

    const lastTokenScanRevalidateTimestamp = yield* toGenerator(
      this.kvStore.get<Record<string, number>>(
        "lastTokenScanRevalidateTimestamp"
      )
    );
    if (lastTokenScanRevalidateTimestamp) {
      for (const [key, value] of Object.entries(
        lastTokenScanRevalidateTimestamp
      )) {
        runInAction(() => {
          this._lastTokenScanRevalidateTimestamp.set(key, value);
        });
      }
    }
    autorun(() => {
      autorun(() => {
        const js = toJS(this._lastTokenScanRevalidateTimestamp);
        const obj = Object.fromEntries(js);
        this.kvStore.set<Record<string, number>>(
          "lastTokenScanRevalidateTimestamp",
          obj
        );
      });
    });

    const dismissedNewTokenFound = yield* toGenerator(
      this.kvStore.get<Record<string, boolean>>("dismissedNewTokenFound")
    );

    if (dismissedNewTokenFound) {
      for (const [key, value] of Object.entries(dismissedNewTokenFound)) {
        runInAction(() => {
          this._newTokenFoundDismissed.set(key, value);
        });
      }
    }

    autorun(() => {
      const js = toJS(this._newTokenFoundDismissed);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, boolean>>("dismissedNewTokenFound", obj);
    });

    yield Promise.all([
      this.updateChainInfosFromBackground(),
      this.updateEnabledChainIdentifiersFromBackground(),
    ]);

    autorun(() => {
      // Change the enabled chain identifiers when the selected key info is changed.
      if (this.keyRingStore.selectedKeyInfo) {
        if (
          this._lastSyncedEnabledChainsVaultId ===
          this.keyRingStore.selectedKeyInfo.id
        ) {
          return;
        }
        this.updateEnabledChainIdentifiersFromBackground();
      }
    });

    this._isInitializing = false;

    // Must not wait!!
    if (!this.updateAllChainInfo) {
      this.tryUpdateEnabledChainInfos();
    } else {
      this.tryUpdateAllChainInfos();
    }
  }

  async tryUpdateEnabledChainInfos(): Promise<void> {
    const msg = new TryUpdateEnabledChainInfosMsg();
    const updated = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    if (updated) {
      await this.updateChainInfosFromBackground();
    }
  }

  async tryUpdateAllChainInfos(): Promise<void> {
    const msg = new TryUpdateAllChainInfosMsg();
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
    this.setEmbeddedChainInfosV2({
      chainInfos: result.chainInfos,
      modulrChainInfos: result.modulrChainInfos,
    });
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

    const id = this.keyRingStore.selectedKeyInfo.id;
    const msg = new GetEnabledChainIdentifiersMsg(id);
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this._tokenScans = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, new GetTokenScansMsg(id))
    );
    this.resetDismissIfNeeded(id, this._tokenScans);

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

      const lastTimestamp = this._lastTokenScanRevalidateTimestamp.get(id);
      if (
        lastTimestamp == null ||
        Date.now() - lastTimestamp > 5 * 60 * 60 * 1000
      ) {
        runInAction(() => {
          this._lastTokenScanRevalidateTimestamp.set(id, Date.now());
        });

        const res = await this.requester.sendMessage(
          BACKGROUND_PORT,
          new RevalidateTokenScansMsg(id)
        );

        if (res.vaultId === this.keyRingStore.selectedKeyInfo?.id) {
          runInAction(() => {
            this._tokenScans = res.tokenScans;
          });
          this.resetDismissIfNeeded(id, this._tokenScans);
        }
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
    const res = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setEmbeddedChainInfosV2({
      chainInfos: res.chainInfos,
      modulrChainInfos: res.modularChainInfos,
    });
  }

  @flow
  *setChainEndpoints(
    chainId: string,
    rpc: string | undefined,
    rest: string | undefined,
    evmRpc: string | undefined
  ) {
    const msg = new SetChainEndpointsMsg(chainId, rpc, rest, evmRpc);
    const res = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setEmbeddedChainInfosV2({
      chainInfos: res.chainInfos,
      modulrChainInfos: res.modularChainInfos,
    });
  }

  @flow
  *resetChainEndpoints(chainId: string) {
    const msg = new ClearChainEndpointsMsg(chainId);
    const res = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setEmbeddedChainInfosV2({
      chainInfos: res.chainInfos,
      modulrChainInfos: res.modularChainInfos,
    });
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
