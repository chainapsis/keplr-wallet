import { APP_PORT } from "@keplr-wallet/router";
import {
  ChainSuggestStore,
  DeferInitialQueryController,
  InteractionStore,
  ObservableQueryBase,
  PermissionStore,
} from "@keplr-wallet/stores";

import { EmbedChainInfos } from "../config";
import { produceEnv } from "../env";
import { KVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { RouterUi } from "../router";
import { AppsStore } from "./apps";
import { ChainStore } from "./chain";
import { LanguageStore } from "./languages";
import { MultisigStore } from "./multisig";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly chainStore: ChainStore;
  public readonly chainSuggestStore: ChainSuggestStore;
  public readonly interactionStore: InteractionStore;
  public readonly multisigStore: MultisigStore;
  public readonly permissionStore: PermissionStore;
  public readonly languageStore: LanguageStore;

  constructor() {
    const router = new RouterUi(produceEnv);
    ObservableQueryBase.experimentalDeferInitialQueryController =
      new DeferInitialQueryController();

    this.interactionStore = new InteractionStore(
      router,
      new MessageRequesterInternal()
    );
    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new MessageRequesterInternal(),
      ObservableQueryBase.experimentalDeferInitialQueryController
    );
    this.chainSuggestStore = new ChainSuggestStore(this.interactionStore);
    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new MessageRequesterInternal()
    );

    this.appsStore = new AppsStore(new KVStore("apps-store"));

    this.multisigStore = new MultisigStore(new KVStore("multisig-store"));

    this.languageStore = new LanguageStore(new KVStore("language-store"));

    router.listen(APP_PORT);
  }
}
