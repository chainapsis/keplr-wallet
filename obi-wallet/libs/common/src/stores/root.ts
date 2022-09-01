import {
  DeferInitialQueryController,
  InteractionStore,
  ObservableQueryBase,
  PermissionStore,
} from "@keplr-wallet/stores";

import { produceEnv } from "../env";
import { KVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { RouterUi } from "../router";
import { AppsStore } from "./apps";
import { MultisigStore } from "./multisig";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly interactionStore: InteractionStore;
  public readonly multisigStore: MultisigStore;
  public readonly permissionStore: PermissionStore;

  constructor() {
    const router = new RouterUi(produceEnv);
    this.interactionStore = new InteractionStore(
      router,
      new MessageRequesterInternal()
    );
    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new MessageRequesterInternal()
    );

    this.appsStore = new AppsStore(new KVStore("apps-store"));

    ObservableQueryBase.experimentalDeferInitialQueryController =
      new DeferInitialQueryController();

    this.multisigStore = new MultisigStore(new KVStore("multisig-store"));
  }
}
