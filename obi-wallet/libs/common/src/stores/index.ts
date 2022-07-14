import {
  AppsStore,
  DeferInitialQueryController,
  ObservableQueryBase,
} from "@keplr-wallet/stores";

import { ChainStore } from "./chain";
import { KVStore } from "./kv-store";
import {
  MessageRequester,
  MessageRequesterInternal,
} from "./message-requester";
import { EmbedChainInfos } from "../config";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;

  constructor() {
    // TODO: KVStore
    this.appsStore = new AppsStore(new KVStore());

    ObservableQueryBase.experimentalDeferInitialQueryController = new DeferInitialQueryController();

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new MessageRequesterInternal(),
      ObservableQueryBase.experimentalDeferInitialQueryController
    );
  }
}
