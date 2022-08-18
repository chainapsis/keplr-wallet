import {
  DeferInitialQueryController,
  ObservableQueryBase,
} from "@keplr-wallet/stores";

import { KVStore } from "../kv-store";
import { AppsStore } from "./apps";
import { MultisigStore } from "./multisig";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly multisigStore: MultisigStore;

  constructor() {
    this.appsStore = new AppsStore(new KVStore("apps-store"));

    ObservableQueryBase.experimentalDeferInitialQueryController =
      new DeferInitialQueryController();

    this.multisigStore = new MultisigStore(new KVStore("multisig-store"));
  }
}
