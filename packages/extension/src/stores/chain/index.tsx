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
  SetPersistentMemoryMsg,
  GetPersistentMemoryMsg,
  GetChainInfosMsg,
  RemoveSuggestedChainInfoMsg,
  TryUpdateChainMsg,
  SetChainEndpointsMsg,
  ResetChainEndpointsMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { MessageRequester } from "@keplr-wallet/router";
import { toGenerator } from "@keplr-wallet/common";

export class ChainStore extends BaseChainStore<ChainInfoWithCoreTypes> {
  @observable
  protected _selectedChainId: string;

  @observable
  protected _isInitializing: boolean = false;
  protected deferChainIdSelect: string = "";

  constructor(
    embedChainInfos: ChainInfo[],
    protected readonly requester: MessageRequester,
    protected readonly deferInitialQueryController: DeferInitialQueryController
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

    this._selectedChainId = embedChainInfos[0].chainId;

    makeObservable(this);

    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
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
    // Save last view chain id to persistent background
    const msg = new SetPersistentMemoryMsg({
      lastViewChainId: this._selectedChainId,
    });
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  @flow
  protected *init() {
    this._isInitializing = true;
    yield this.getChainInfosFromBackground();

    this.deferInitialQueryController.ready();

    // Get last view chain id to persistent background
    const msg = new GetPersistentMemoryMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    if (!this.deferChainIdSelect) {
      if (result && result.lastViewChainId) {
        this.selectChain(result.lastViewChainId);
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
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    if (result.updated) {
      yield this.getChainInfosFromBackground();
    }
  }

  @flow
  *setChainEndpoints(
    chainId: string,
    rpc: string | undefined,
    rest: string | undefined
  ) {
    const msg = new SetChainEndpointsMsg(chainId, rpc, rest);
    const newChainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setChainInfos(newChainInfos);

    ObservableQuery.refreshAllObserved();
  }

  @flow
  *resetChainEndpoints(chainId: string) {
    const msg = new ResetChainEndpointsMsg(chainId);
    const newChainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setChainInfos(newChainInfos);

    ObservableQuery.refreshAllObserved();
  }
}
