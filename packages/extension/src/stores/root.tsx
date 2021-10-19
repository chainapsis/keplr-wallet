import { ChainStore } from "./chain";
import { AnalyticsStore } from "./analytics";
import { EmbedChainInfos } from "../config";
import { FiatCurrencies } from "../config.ui";
import {
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
  PermissionStore,
  SignInteractionStore,
  LedgerInitStore,
  TokensStore,
  ChainSuggestStore,
  IBCChannelStore,
  IBCCurrencyRegsitrar,
  QueriesWithCosmosAndSecret,
  AccountWithCosmosAndSecret,
  getKeplrFromWindow,
} from "@keplr-wallet/stores";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  ExtensionRouter,
  ContentScriptEnv,
  ContentScriptGuards,
  InExtensionMessageRequester,
  APP_PORT,
} from "@keplr-wallet/router";
import { ChainInfoWithEmbed } from "@keplr-wallet/background";
import { FiatCurrency } from "@keplr-wallet/types";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;
  public readonly ibcChannelStore: IBCChannelStore;

  protected readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly ledgerInitStore: LedgerInitStore;
  public readonly chainSuggestStore: ChainSuggestStore;

  public readonly queriesStore: QueriesStore<QueriesWithCosmosAndSecret>;
  public readonly accountStore: AccountStore<AccountWithCosmosAndSecret>;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly tokensStore: TokensStore<ChainInfoWithEmbed>;

  public readonly analyticsStore: AnalyticsStore;

  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithEmbed>;

  constructor() {
    const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
    router.addGuard(ContentScriptGuards.checkMessageIsInternal);

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new InExtensionMessageRequester()
    );

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new InExtensionMessageRequester()
    );

    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          window.dispatchEvent(new Event(type));
        },
      },
      "scrypt",
      this.chainStore,
      new InExtensionMessageRequester(),
      this.interactionStore
    );

    this.ibcChannelStore = new IBCChannelStore(
      new ExtensionKVStore("store_ibc_channel")
    );

    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new InExtensionMessageRequester()
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);
    this.ledgerInitStore = new LedgerInitStore(
      this.interactionStore,
      new InExtensionMessageRequester()
    );
    this.chainSuggestStore = new ChainSuggestStore(this.interactionStore);

    this.queriesStore = new QueriesStore(
      new ExtensionKVStore("store_queries"),
      this.chainStore,
      getKeplrFromWindow,
      QueriesWithCosmosAndSecret
    );

    const chainOpts = this.chainStore.chainInfos.map((chainInfo) => {
      // In certik, change the msg type of the MsgSend to "bank/MsgSend"
      if (chainInfo.chainId.startsWith("shentu-")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                type: "bank/MsgSend",
              },
            },
          },
        };
      }

      // In akash or sifchain, increase the default gas for sending
      if (
        chainInfo.chainId.startsWith("akashnet-") ||
        chainInfo.chainId.startsWith("sifchain")
      ) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 120000,
              },
            },
          },
        };
      }

      return { chainId: chainInfo.chainId };
    });

    // What a silly...
    chainOpts.push(
      {
        chainId: "bombay-12",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        prefetching: false,
        msgOpts: {
          send: {
            native: {
              type: "bank/MsgSend",
            },
          },
        },
      },
      {
        chainId: "columbus-5",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        prefetching: false,
        msgOpts: {
          send: {
            native: {
              type: "bank/MsgSend",
            },
          },
        },
      }
    );

    this.accountStore = new AccountStore(
      window,
      AccountWithCosmosAndSecret,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          // When the unlock request sent from external webpage,
          // it will open the extension popup below the uri "/unlock".
          // But, in this case, if the prefetching option is true, it will redirect
          // the page to the "/unlock" with **interactionInternal=true**
          // because prefetching will request the unlock from the internal.
          // To prevent this problem, just check the first uri is "#/unlcok" and
          // if it is "#/unlock", don't use the prefetching option.
          prefetching: !window.location.href.includes("#/unlock"),
          suggestChain: false,
          autoInit: true,
          getKeplr: getKeplrFromWindow,
        },
        chainOpts,
      }
    );

    this.priceStore = new CoinGeckoPriceStore(
      new ExtensionKVStore("store_prices"),
      FiatCurrencies.reduce<{
        [vsCurrency: string]: FiatCurrency;
      }>((obj, fiat) => {
        obj[fiat.currency] = fiat;
        return obj;
      }, {}),
      "usd"
    );

    this.tokensStore = new TokensStore(
      window,
      this.chainStore,
      new InExtensionMessageRequester(),
      this.interactionStore
    );

    this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfoWithEmbed>(
      new ExtensionKVStore("store_ibc_curreny_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.accountStore,
      this.queriesStore
    );

    this.analyticsStore = new AnalyticsStore(
      "KeplrExtension",
      {
        amplitudeConfig: {
          platform: "Extension",
          includeUtm: true,
          includeReferrer: true,
          includeFbclid: true,
          includeGclid: true,
          saveEvents: true,
          saveParamsReferrerOncePerSession: false,
        },
      },
      this.accountStore,
      this.keyRingStore
    );

    router.listen(APP_PORT);
  }
}

export function createRootStore() {
  return new RootStore();
}
