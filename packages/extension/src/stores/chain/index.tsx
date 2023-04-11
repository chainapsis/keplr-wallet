import { computed, flow, makeObservable, observable } from "mobx";

import {
  ChainStore as BaseChainStore,
  IChainInfoImpl,
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

  @observable.ref
  protected _enabledChainIdentifiers: string[] = [];

  constructor(
    protected readonly embedChainInfos: ChainInfo[],
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

    this._enabledChainIdentifiers = [
      ChainIdHelper.parse(embedChainInfos[0].chainId).identifier,
    ];

    makeObservable(this);

    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  @computed
  protected get enabledChainIdentifiesMap(): Map<string, true> {
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
    const msg = new ToggleChainsMsg(chainIds);
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
  }

  @flow
  *enableChainInfoInUI(...chainIds: string[]) {
    const msg = new EnableChainsMsg(chainIds);
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
  }

  @flow
  *disableChainInfoInUI(...chainIds: string[]) {
    const msg = new DisableChainsMsg(chainIds);
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
    const msg = new GetEnabledChainIdentifiersMsg();
    this._enabledChainIdentifiers = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
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
