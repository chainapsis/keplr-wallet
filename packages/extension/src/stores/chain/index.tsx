import { observable, action, computed, makeObservable, flow } from "mobx";

import {
  ChainInfoInner,
  ChainStore as BaseChainStore,
  DeferInitialQueryController,
  ObservableQuery,
} from "@keplr-wallet/stores";

import { ChainInfo } from "@keplr-wallet/types";
import {
  ChainInfoWithCoreTypes,
  GetChainInfosWithCoreTypesMsg,
  RemoveSuggestedChainInfoMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { MessageRequester } from "@keplr-wallet/router";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class ChainStore extends BaseChainStore<ChainInfoWithCoreTypes> {
  @observable
  protected _selectedChainId: string;

  @observable
  protected _isInitializing: boolean = false;
  protected deferChainIdSelect: string = "";

  @observable
  protected chainInfoInUIConfig: {
    disabledChains: string[];
  };

  constructor(
    protected readonly kvStore: KVStore,
    embedChainInfos: ChainInfo[],
    protected readonly requester: MessageRequester,
    protected readonly deferInitialQueryController: DeferInitialQueryController
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

    this._selectedChainId = embedChainInfos[0].chainId;

    this.chainInfoInUIConfig = {
      disabledChains: [],
    };

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
    return this.chainInfos.map((chainInfo) => {
      if (this.disabledChainInfosInUI.includes(chainInfo)) {
        return {
          chainInfo,
          disabled: true,
        };
      } else {
        return {
          chainInfo,
          disabled: false,
        };
      }
    });
  }

  @computed
  protected get enabledChainInfosInUI() {
    return this.chainInfos.filter(
      (chainInfo) =>
        !this.chainInfoInUIConfig.disabledChains.includes(
          ChainIdHelper.parse(chainInfo.chainId).identifier
        )
    );
  }

  @computed
  get disabledChainInfosInUI() {
    return this.chainInfos.filter((chainInfo) =>
      this.chainInfoInUIConfig.disabledChains.includes(
        ChainIdHelper.parse(chainInfo.chainId).identifier
      )
    );
  }

  @flow
  *toggleChainInfoInUI(chainId: string) {
    chainId = ChainIdHelper.parse(chainId).identifier;
    let disableChainIds = [];

    if (this.chainInfoInUIConfig.disabledChains.includes(chainId)) {
      disableChainIds = this.chainInfoInUIConfig.disabledChains.filter(
        (chain) => chain !== chainId
      );
    } else {
      if (this.enabledChainInfosInUI.length === 1) {
        // Can't turn off all chains.
        return;
      }

      disableChainIds = [...this.chainInfoInUIConfig.disabledChains, chainId];
    }

    yield this.kvStore.set<{ disabledChains: string[] }>(
      "extension_chainInfoInUIConfig",
      {
        disabledChains: disableChainIds,
      }
    );

    this.chainInfoInUIConfig.disabledChains = disableChainIds;

    if (ChainIdHelper.parse(this.current.chainId).identifier === chainId) {
      const other = this.chainInfosInUI.find(
        (chainInfo) =>
          ChainIdHelper.parse(chainInfo.chainId).identifier !== chainId
      );

      if (other) {
        this.selectChain(other.chainId);
        this.saveLastViewChainId();
      }
    }
  }

  get selectedChainId(): string {
    return this._selectedChainId;
  }

  @action
  selectChain(chainId: string) {
    if (this._isInitializing) {
      this.deferChainIdSelect = chainId;
    }
    this._selectedChainId = chainId;
  }

  @computed
  get current(): ChainInfoInner<ChainInfoWithCoreTypes> {
    if (this.hasChain(this._selectedChainId)) {
      return this.getChain(this._selectedChainId);
    }

    return this.chainInfos[0];
  }

  @flow
  *saveLastViewChainId() {
    yield this.kvStore.set<string>(
      "extension_last_view_chain_id",
      this._selectedChainId
    );
  }

  @flow
  protected *init() {
    this._isInitializing = true;
    yield this.getChainInfosFromBackground();

    this.deferInitialQueryController.ready();

    const lastViewChainId = yield* toGenerator(
      this.kvStore.get<string>("extension_last_view_chain_id")
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

    const chainInfoUI = yield* toGenerator(
      this.kvStore.get<{ disabledChains: string[] }>(
        "extension_chainInfoInUIConfig"
      )
    );

    if (chainInfoUI) {
      this.chainInfoInUIConfig.disabledChains =
        chainInfoUI.disabledChains ?? [];
    }
  }

  @flow
  protected *getChainInfosFromBackground() {
    const msg = new GetChainInfosWithCoreTypesMsg();
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

    ObservableQuery.refreshAllObserved();
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

    ObservableQuery.refreshAllObserved();
  }
}
