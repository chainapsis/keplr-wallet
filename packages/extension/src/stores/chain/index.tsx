import { observable, action, computed, makeObservable, flow } from "mobx";

import {
  ChainInfoInner,
  ChainStore as BaseChainStore,
} from "@keplr-wallet/stores";

import { ChainInfo } from "@keplr-wallet/types";
import {
  ChainInfoWithEmbed,
  SetPersistentMemoryMsg,
  GetPersistentMemoryMsg,
  GetChainInfosMsg,
  RemoveSuggestedChainInfoMsg,
  TryUpdateChainMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { MessageRequester } from "@keplr-wallet/router";
import { toGenerator } from "@keplr-wallet/common";

export class ChainStore extends BaseChainStore<ChainInfoWithEmbed> {
  @observable
  protected selectedChainId: string;

  @observable
  protected _isInitializing: boolean = false;
  protected deferChainIdSelect: string = "";

  constructor(
    embedChainInfos: ChainInfo[],
    protected readonly requester: MessageRequester
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

    makeObservable(this);

    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  @action
  selectChain(chainId: string) {
    if (this._isInitializing) {
      this.deferChainIdSelect = chainId;
    }
    this.selectedChainId = chainId;
  }

  @computed
  get current(): ChainInfoInner<ChainInfoWithEmbed> {
    if (this.hasChain(this.selectedChainId)) {
      return this.getChain(this.selectedChainId);
    }

    return this.chainInfos[0];
  }

  @flow
  *saveLastViewChainId() {
    // Save last view chain id to persistent background
    const msg = new SetPersistentMemoryMsg({
      lastViewChainId: this.selectedChainId,
    });
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  @flow
  protected *init() {
    this._isInitializing = true;
    yield this.getChainInfosFromBackground();

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
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.getChainInfosFromBackground();
  }
}
