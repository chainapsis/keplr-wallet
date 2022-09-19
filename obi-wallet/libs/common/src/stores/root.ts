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
import { KeplrChainStore } from "./keplr-chain";
import { LanguageStore } from "./language";
import { MultisigStore } from "./multisig";
import { SinglesigStore } from "./singlesig";
import { WalletStore } from "./wallet";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly balancesStore: BalancesStore;
  public readonly chainStore: ChainStore;
  public readonly demoStore: DemoStore;
  public readonly languageStore: LanguageStore;
  public readonly multisigStore: MultisigStore;
  public readonly singlesigStore: SinglesigStore;
  public readonly walletStore: WalletStore;

  // Hide Keplr-related stores
  protected readonly keplrChainStore: KeplrChainStore;
  protected readonly keplrChainSuggestStore: ChainSuggestStore;
  protected readonly keplrInteractionStore: InteractionStore;
  protected readonly keplrPermissionStore: PermissionStore;

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

    this.keplrInteractionStore = new InteractionStore(
      router,
      new MessageRequesterInternal()
    );
    this.keplrChainStore = new KeplrChainStore(
      EmbedChainInfos,
      new MessageRequesterInternal(),
      ObservableQueryBase.experimentalDeferInitialQueryController
    );
    this.keplrChainSuggestStore = new ChainSuggestStore(
      this.keplrInteractionStore
    );
    this.keplrPermissionStore = new PermissionStore(
      this.keplrInteractionStore,
      new MessageRequesterInternal()
    );

    this.appsStore = new AppsStore(new KVStore("apps-store"));
    this.chainStore = new ChainStore({ defaultChain });
    this.demoStore = new DemoStore();
    this.languageStore = new LanguageStore({
      deviceLanguage,
      enabledLanguages,
      defaultLanguage,
      kvStore: new KVStore("language-store"),
    });
    this.singlesigStore = new SinglesigStore(new KVStore("singlesig-store"));

    this.multisigStore = new MultisigStore({
      chainStore: this.chainStore,
      kvStore: new KVStore("multisig-store"),
    });

    this.balancesStore = new BalancesStore({
      chainStore: this.chainStore,
      multisigStore: this.multisigStore,
    });
    this.walletStore = new WalletStore({
      demoStore: this.demoStore,
      singlesigStore: this.singlesigStore,
      multisigStore: this.multisigStore,
    });

    router.listen(APP_PORT);
  }

  public get permissionStore() {
    return this.keplrPermissionStore;
  }
}
