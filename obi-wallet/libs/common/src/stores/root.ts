import {
  DeferInitialQueryController,
  InteractionStore,
  KeyRingStore,
  ObservableQueryBase,
} from "@keplr-wallet/stores";

import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { EmbedChainInfos } from "../config";
import { KVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { produceEnv } from "../env";
import { RouterUi } from "../router";
import EventEmitter from "eventemitter3";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;
  public readonly interactionStore: InteractionStore;
  public readonly keyRingStore: KeyRingStore;

  constructor() {
    const router = new RouterUi(produceEnv);
    const eventEmitter = new EventEmitter();

    this.appsStore = new AppsStore(new KVStore("apps-store"));

    ObservableQueryBase.experimentalDeferInitialQueryController =
      new DeferInitialQueryController();

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new MessageRequesterInternal(),
      ObservableQueryBase.experimentalDeferInitialQueryController
    );
    this.interactionStore = new InteractionStore(
      router,
      new MessageRequesterInternal()
    );
    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          console.warn("dispatching", type);
          eventEmitter.emit(type);
        },
      },
      "scrypt",
      0,
      this.chainStore,
      new MessageRequesterInternal(),
      this.interactionStore
    );
  }
}
