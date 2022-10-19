import { APP_PORT } from "@keplr-wallet/router";
import {
  ChainSuggestStore,
  DeferInitialQueryController,
  InteractionStore as KeplrInteractionStore,
  ObservableQueryBase,
  PermissionStore,
  SignInteractionStore,
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
import { InteractionStore } from "./interaction";
import { KeplrChainStore } from "./keplr-chain";
import { LanguageStore } from "./language";
import { SettingsStore } from "./settings";
import { WalletsStore } from "./wallets";

export class RootStore {
  public readonly appsStore: AppsStore;
  public readonly balancesStore: BalancesStore;
  public readonly chainStore: ChainStore;
  public readonly interactionStore: InteractionStore;
  public readonly languageStore: LanguageStore;
  public readonly settingsStore: SettingsStore;
  public readonly walletsStore: WalletsStore;

  // Hide Keplr-related stores by default
  protected readonly keplrChainStore: KeplrChainStore;
  protected readonly keplrChainSuggestStore: ChainSuggestStore;
  protected readonly keplrInteractionStore: KeplrInteractionStore;
  protected readonly keplrPermissionStore: PermissionStore;
  protected readonly keplrSignInteractionStore: SignInteractionStore;

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

    this.keplrInteractionStore = new KeplrInteractionStore(
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
    this.keplrSignInteractionStore = new SignInteractionStore(
      this.keplrInteractionStore
    );

    this.appsStore = new AppsStore({ kvStore: new KVStore("apps-store") });
    this.chainStore = new ChainStore({ defaultChain });
    this.interactionStore = new InteractionStore(this.keplrInteractionStore);
    this.languageStore = new LanguageStore({
      deviceLanguage,
      enabledLanguages,
      defaultLanguage,
      kvStore: new KVStore("language-store"),
    });
    this.settingsStore = new SettingsStore();

    this.walletsStore = new WalletsStore({
      chainStore: this.chainStore,
      kvStore: new KVStore("wallets-store"),
      legacyKVStores: {
        multisig: new KVStore("multisig-store"),
        singlesig: new KVStore("singlesig-store"),
      },
    });

    this.balancesStore = new BalancesStore({
      chainStore: this.chainStore,
      walletsStore: this.walletsStore,
    });

    router.listen(APP_PORT);
  }

  public get permissionStore() {
    return this.keplrPermissionStore;
  }

  public get signInteractionStore() {
    return this.keplrSignInteractionStore;
  }
}
