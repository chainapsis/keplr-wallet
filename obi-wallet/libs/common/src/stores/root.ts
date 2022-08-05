import {
  DeferInitialQueryController,
  InteractionStore,
  KeyRingStore,
  ObservableQueryBase,
} from "@keplr-wallet/stores";
import EventEmitter from "eventemitter3";

import { EmbedChainInfos } from "../config";
import { produceEnv } from "../env";
import { KVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { RouterUi } from "../router";
import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { MultisigStore } from "./multisig";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;
  public readonly interactionStore: InteractionStore;
  public readonly keyRingStore: KeyRingStore;
  public readonly multisigStore: MultisigStore;

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
    this.multisigStore = new MultisigStore(new KVStore("multisig-store"));
  }
}
