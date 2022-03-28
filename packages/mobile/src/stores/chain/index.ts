import {
  action,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

import { ChainStore as BaseChainStore } from "@keplr-wallet/stores";

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
    sortedChains: string[];
    disabledChains: Record<string, boolean | undefined>;
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
              sortedChains: this.chainInfosInUI.map((chainInfo) => {
                const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
                return chainIdentifier.identifier;
              }),
              disabledChains: {},
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
    return this.chainInfosWithUIConfig
      .filter(({ disabled }) => !disabled)
      .map(({ chainInfo }) => chainInfo);
  }

  @computed
  get chainInfosWithUIConfig() {
    const chainSortInfo: Record<string, number | undefined> =
      this.chainInfoInUIConfig.value?.sortedChains.reduce<
        Record<string, number | undefined>
      >((previous, current, index) => {
        previous[current] = index;
        return previous;
      }, {}) ?? {};
    const disabledChains: Record<string, boolean | undefined> =
      this.chainInfoInUIConfig.value?.disabledChains ?? {};

    return this.chainInfos
      .filter((chainInfo) => {
        return !chainInfo.raw.hideInUI;
      })
      .sort((chainInfo1, chainInfo2) => {
        const index1 =
          chainSortInfo[ChainIdHelper.parse(chainInfo1.chainId).identifier];
        const index2 =
          chainSortInfo[ChainIdHelper.parse(chainInfo2.chainId).identifier];

        if (index1 == null) {
          if (index2 == null) {
            // TODO: Handle stable sort.
            //       JS array sort doesn't ensure stable sort.
            return 0;
          } else {
            return 1;
          }
        }
        if (index2 == null) {
          return -1;
        }

        return index1 < index2 ? -1 : 1;
      })
      .map((chainInfo) => {
        const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);

        return {
          chainInfo,
          disabled: disabledChains[chainIdentifier.identifier] === true,
        };
      });
  }

  setChainInfosInUIOrder(chainIds: string[]) {
    chainIds = chainIds.map(
      (chainId) => ChainIdHelper.parse(chainId).identifier
    );

    // No need to wait
    this.chainInfoInUIConfig.setValue({
      sortedChains: chainIds,
      disabledChains: this.chainInfoInUIConfig.value?.disabledChains ?? {},
    });
  }

  toggleChainInfoInUI(chainId: string) {
    chainId = ChainIdHelper.parse(chainId).identifier;

    if (this.chainInfoInUIConfig.value) {
      const disabledChains = {
        ...this.chainInfoInUIConfig.value.disabledChains,
      };

      if (this.chainInfoInUIConfig.value.disabledChains[chainId]) {
        delete disabledChains[chainId];
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

        disabledChains[chainId] = true;
      }

      // No need to wait
      this.chainInfoInUIConfig.setValue({
        sortedChains: this.chainInfoInUIConfig.value.sortedChains,
        disabledChains: disabledChains,
      });
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
  protected *getChainInfosFromBackground() {
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
