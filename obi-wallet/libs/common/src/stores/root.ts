import {
  DeferInitialQueryController,
  ObservableQueryBase,
} from "@keplr-wallet/stores";

import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { KVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { EmbedChainInfos } from "../config";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;

  constructor() {
    this.appsStore = new AppsStore(new KVStore("apps-store"));

    ObservableQueryBase.experimentalDeferInitialQueryController =
      new DeferInitialQueryController();

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new MessageRequesterInternal(),
      ObservableQueryBase.experimentalDeferInitialQueryController
    );
  }
}
