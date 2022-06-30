import {
  action,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

import {
  ChainInfoInner,
  ChainStore as BaseChainStore,
} from "@keplr-wallet/stores";

import { ChainInfo } from "@keplr-wallet/types";
import {
  ChainInfoWithEmbed,
  GetChainInfosMsg,
  RemoveSuggestedChainInfoMsg,
  TryUpdateChainMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { AppChainInfo } from "../../config";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Vibration } from "react-native";
import { stableSort } from "../../utils/stable-sort";

class ObservableKVStore<Value> {
  @observable.ref
  protected _value: Value | undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly _key: string,
    protected readonly storeOptions: {
      onInit?: () => void;
    } = {}
  ) {
    makeObservable(this);

    this.init();
  }

  async init() {
    const value = await this.kvStore.get<Value>(this.key);
    runInAction(() => {
      this._value = value;
    });

    if (this.storeOptions.onInit) {
      this.storeOptions.onInit();
    }
  }

  get key(): string {
    return this._key;
  }

  get value(): Value | undefined {
    return this._value;
  }

  async setValue(value: Value | undefined) {
    runInAction(() => {
      this._value = value;
    });

    await this.kvStore.set(this.key, value);
  }
}

export class ChainStore extends BaseChainStore<
  ChainInfoWithEmbed & AppChainInfo
> {
  @observable
  protected selectedChainId: string;

  @observable
  protected _isInitializing: boolean = false;
  protected deferChainIdSelect: string = "";

  protected chainInfoInUIConfig: ObservableKVStore<{
    // Any chains that's not disabled is classified as an enabled chain.
    // This array manages the sorting order of enabled chain(anything not in the disabledChains) used in the UI.
    // Anything not included in neither sortedEnabledChains and disabledChains would go to the very end of enabled chains in the UI.
    // Array of chain identifiers
    sortedEnabledChains: string[];
    // This array is what actually controls the enabled and disabled chains.
    // This array also controls the sorting order of the disabled chains showed in the UI.
    // Array of chain identifiers
    disabledChains: string[];
  }>;

  constructor(
    embedChainInfos: ChainInfo[],
    protected readonly requester: MessageRequester,
    protected readonly kvStore: KVStore
  ) {
    super(
      embedChainInfos.map((chainInfo) => {
        return {
          ...chainInfo,
          ...{
            embeded: true,
          },
        };
      })
    );

    this.selectedChainId = embedChainInfos[0].chainId;
    this.chainInfoInUIConfig = new ObservableKVStore(
      kvStore,
      "chain_info_in_ui_config",
      {
        onInit: () => {
          if (!this.chainInfoInUIConfig.value) {
            this.chainInfoInUIConfig.setValue({
              sortedEnabledChains: this.chainInfos
                .filter((chainInfo) => !chainInfo.raw.hideInUI)
                .map((chainInfo) => {
                  const chainIdentifier = ChainIdHelper.parse(
                    chainInfo.chainId
                  );
                  return chainIdentifier.identifier;
                }),
              disabledChains: [],
            });
          }
        },
      }
    );

    makeObservable(this);

    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  @computed
  get chainInfosInUI() {
    return this.enabledChainInfosInUI;
  }

  @computed
  get chainInfosWithUIConfig() {
    return this.enabledChainInfosInUI
      .map((chainInfo) => {
        return {
          chainInfo,
          disabled: false,
        };
      })
      .concat(
        this.disabledChainInfosInUI.map((chainInfo) => {
          return {
            chainInfo,
            disabled: true,
          };
        })
      );
  }

  @computed
  protected get enabledChainInfosInUI() {
    const chainSortInfo: Record<string, number | undefined> =
      this.chainInfoInUIConfig.value?.sortedEnabledChains.reduce<
        Record<string, number | undefined>
      >((previous, current, index) => {
        previous[current] = index;
        return previous;
      }, {}) ?? {};

    const disabledChainsMap: Record<string, boolean | undefined> =
      this.chainInfoInUIConfig.value?.disabledChains.reduce<
        Record<string, boolean | undefined>
      >((previous, current) => {
        previous[current] = true;
        return previous;
      }, {}) ?? {};

    const chainSortFn = (
      chainInfo1: ChainInfoInner,
      chainInfo2: ChainInfoInner
    ): number => {
      const chainIdentifier1 = ChainIdHelper.parse(chainInfo1.chainId);
      const chainIdentifier2 = ChainIdHelper.parse(chainInfo2.chainId);

      const index1 = chainSortInfo[chainIdentifier1.identifier];
      const index2 = chainSortInfo[chainIdentifier2.identifier];

      if (index1 == null) {
        if (index2 == null) {
          return 0;
        } else {
          return 1;
        }
      }
      if (index2 == null) {
        return -1;
      }

      return index1 < index2 ? -1 : 1;
    };

    return stableSort(
      this.chainInfos
        .filter((chainInfo) => !chainInfo.raw.hideInUI)
        .filter(
          (chainInfo) =>
            !disabledChainsMap[
              ChainIdHelper.parse(chainInfo.chainId).identifier
            ]
        ),
      chainSortFn
    );
  }

  @computed
  protected get disabledChainInfosInUI() {
    const chainSortInfo: Record<string, number | undefined> =
      this.chainInfoInUIConfig.value?.disabledChains.reduce<
        Record<string, number | undefined>
      >((previous, current, index) => {
        previous[current] = index;
        return previous;
      }, {}) ?? {};

    const disabledChainsMap: Record<string, boolean | undefined> =
      this.chainInfoInUIConfig.value?.disabledChains.reduce<
        Record<string, boolean | undefined>
      >((previous, current) => {
        previous[current] = true;
        return previous;
      }, {}) ?? {};

    const chainSortFn = (
      chainInfo1: ChainInfoInner,
      chainInfo2: ChainInfoInner
    ): number => {
      const chainIdentifier1 = ChainIdHelper.parse(chainInfo1.chainId);
      const chainIdentifier2 = ChainIdHelper.parse(chainInfo2.chainId);

      const index1 = chainSortInfo[chainIdentifier1.identifier];
      const index2 = chainSortInfo[chainIdentifier2.identifier];

      if (index1 == null) {
        if (index2 == null) {
          return 0;
        } else {
          return 1;
        }
      }
      if (index2 == null) {
        return -1;
      }

      return index1 < index2 ? -1 : 1;
    };

    return stableSort(
      this.chainInfos
        .filter((chainInfo) => !chainInfo.raw.hideInUI)
        .filter(
          (chainInfo) =>
            disabledChainsMap[ChainIdHelper.parse(chainInfo.chainId).identifier]
        ),
      chainSortFn
    );
  }

  setChainInfosInUIOrder(chainIds: string[]) {
    chainIds = chainIds.map(
      (chainId) => ChainIdHelper.parse(chainId).identifier
    );

    const enabledChainsMap: Record<
      string,
      boolean | undefined
    > = this.enabledChainInfosInUI.reduce<Record<string, boolean | undefined>>(
      (previous, current) => {
        previous[ChainIdHelper.parse(current.chainId).identifier] = true;
        return previous;
      },
      {}
    );

    const disabledChainsMap: Record<
      string,
      boolean | undefined
    > = this.disabledChainInfosInUI.reduce<Record<string, boolean | undefined>>(
      (previous, current) => {
        previous[ChainIdHelper.parse(current.chainId).identifier] = true;
        return previous;
      },
      {}
    );

    // No need to wait
    this.chainInfoInUIConfig.setValue({
      sortedEnabledChains: chainIds.filter(
        (chainIdentifier) => enabledChainsMap[chainIdentifier]
      ),
      disabledChains: chainIds.filter(
        (chainIdentifier) => disabledChainsMap[chainIdentifier]
      ),
    });
  }

  toggleChainInfoInUI(chainId: string) {
    chainId = ChainIdHelper.parse(chainId).identifier;

    if (this.chainInfoInUIConfig.value) {
      const i = this.chainInfoInUIConfig.value.disabledChains.indexOf(chainId);
      if (i >= 0) {
        const disabledChains = this.chainInfoInUIConfig.value.disabledChains.slice();
        disabledChains.splice(i, 1);

        // No need to wait
        this.chainInfoInUIConfig.setValue({
          sortedEnabledChains: [
            ...this.chainInfoInUIConfig.value.sortedEnabledChains,
            chainId,
          ],
          disabledChains: disabledChains,
        });
      } else {
        const chainInfosInUI = this.chainInfosInUI;
        if (chainInfosInUI.length === 1) {
          // Can't turn off all chain.
          Vibration.vibrate();
          return;
        }

        if (ChainIdHelper.parse(this.current.chainId).identifier === chainId) {
          // If user wants to turn off the selected chain,
          // change the selected chain.
          const other = chainInfosInUI.find(
            (chainInfo) =>
              ChainIdHelper.parse(chainInfo.chainId).identifier !== chainId
          );
          if (other) {
            this.selectChain(other.chainId);
            // No need to wait
            this.saveLastViewChainId();
          }
        }

        const sortedEnabledChains = this.chainInfoInUIConfig.value.sortedEnabledChains.slice();
        const i = this.chainInfoInUIConfig.value.sortedEnabledChains.indexOf(
          chainId
        );
        if (i >= 0) {
          sortedEnabledChains.splice(i, 1);
        }

        // No need to wait
        this.chainInfoInUIConfig.setValue({
          sortedEnabledChains,
          disabledChains: [
            chainId,
            ...this.chainInfoInUIConfig.value.disabledChains,
          ],
        });
      }
    }
  }

  @action
  selectChain(chainId: string) {
    if (this._isInitializing) {
      this.deferChainIdSelect = chainId;
    }
    this.selectedChainId = chainId;
  }

  @computed
  get current(): ChainInfoWithEmbed {
    if (this.hasChain(this.selectedChainId)) {
      return this.getChain(this.selectedChainId).raw;
    }

    return this.chainInfos[0].raw;
  }

  async saveLastViewChainId() {
    // Save last view chain id to kv store
    await this.kvStore.set<string>("last_view_chain_id", this.selectedChainId);
  }

  @flow
  protected *init() {
    this._isInitializing = true;
    yield this.getChainInfosFromBackground();

    // Get last view chain id from kv store
    const lastViewChainId = yield* toGenerator(
      this.kvStore.get<string>("last_view_chain_id")
    );

    if (!this.deferChainIdSelect) {
      if (lastViewChainId) {
        this.selectChain(lastViewChainId);
      }
    }
    this._isInitializing = false;

    if (this.deferChainIdSelect) {
      this.selectChain(this.deferChainIdSelect);
      this.deferChainIdSelect = "";
    }
  }

  @flow
  *getChainInfosFromBackground() {
    const msg = new GetChainInfosMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.setChainInfos(result.chainInfos);
  }

  @flow
  *removeChainInfo(chainId: string) {
    const msg = new RemoveSuggestedChainInfoMsg(chainId);
    const chainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setChainInfos(chainInfos);
  }

  @flow
  *tryUpdateChain(chainId: string) {
    const msg = new TryUpdateChainMsg(chainId);
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.getChainInfosFromBackground();
  }
}
