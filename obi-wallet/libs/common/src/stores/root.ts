import { APP_PORT } from "@keplr-wallet/router";
import {
  ChainSuggestStore,
  DeferInitialQueryController,
  InteractionStore,
  ObservableQueryBase,
  PermissionStore,
} from "@keplr-wallet/stores";

import { Chain } from "../chains";
import { EmbedChainInfos } from "../config";
import { produceEnv } from "../env";
import { KVStore } from "../kv-store";
import { MessageRequesterInternal } from "../message-requester";
import { RouterUi } from "../router";
import { AppsStore } from "./apps";
import { BalancesStore } from "./balances";
import { ChainStore } from "./chain";
import { DemoStore } from "./demo";
import { LanguageStore } from "./language";
import { MultisigStore } from "./multisig";
import { SinglesigStore } from "./singlesig";
import { WalletStore } from "./wallet";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly balancesStore: BalancesStore;
  public readonly chainStore: ChainStore;
  public readonly chainSuggestStore: ChainSuggestStore;
  public readonly demoStore: DemoStore;
  public readonly interactionStore: InteractionStore;
  public readonly languageStore: LanguageStore;
  public readonly multisigStore: MultisigStore;
  public readonly singlesigStore: SinglesigStore;
  public readonly permissionStore: PermissionStore;
  public readonly walletStore: WalletStore;

  constructor({
    defaultChain,
    deviceLanguage,
    enabledLanguages,
    defaultLanguage,
  }: {
    defaultChain: Chain;
    deviceLanguage: string;
    enabledLanguages: string[];
    defaultLanguage: string;
  }) {
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
    this.demoStore = new DemoStore();
    this.languageStore = new LanguageStore({
      deviceLanguage,
      enabledLanguages,
      defaultLanguage,
      kvStore: new KVStore("language-store"),
    });
    this.multisigStore = new MultisigStore(
      defaultChain,
      new KVStore("create-multisig-store")
    );
    this.singlesigStore = new SinglesigStore();

    this.balancesStore = new BalancesStore(this.multisigStore);
    this.walletStore = new WalletStore({
      demoStore: this.demoStore,
      singlesigStore: this.singlesigStore,
      multisigStore: this.multisigStore,
    });

    router.listen(APP_PORT);
  }
}
