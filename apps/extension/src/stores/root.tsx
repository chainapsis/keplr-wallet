import { ChainStore } from "./chain";
import { CommunityChainInfoRepo, EmbedChainInfos } from "../config";
import {
  CoinGeckoAPIEndPoint,
  CoinGeckoGetPrice,
  EthereumEndpoint,
  FiatCurrencies,
  ICNSInfo,
  TokenContractListURL,
  GoogleMeasurementId,
  GoogleAPIKeyForMeasurement,
  SwapVenue,
  CoinGeckoCoinDataByTokenAddress,
} from "../config.ui";
import {
  AccountStore,
  CoinGeckoPriceStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  OsmosisQueries,
  getKeplrFromWindow,
  QueriesStore,
  SecretAccount,
  SecretQueries,
  ICNSQueries,
  AgoricQueries,
  LSMCurrencyRegistrar,
  TokenFactoryCurrencyRegistrar,
} from "@keplr-wallet/stores";
import {
  IBCChannelStore,
  IBCCurrencyRegistrar,
} from "@keplr-wallet/stores-ibc";
import {
  ChainSuggestStore,
  InteractionStore,
  KeyRingStore,
  PermissionStore,
  SignInteractionStore,
  TokensStore,
  ICNSInteractionStore,
  PermissionManagerStore,
  SignEthereumInteractionStore,
} from "@keplr-wallet/stores-core";
import {
  KeplrETCQueries,
  GravityBridgeCurrencyRegistrar,
  AxelarEVMBridgeCurrencyRegistrar,
} from "@keplr-wallet/stores-etc";
import {
  EthereumQueries,
  EthereumAccountStore,
  ERC20CurrencyRegistrar,
} from "@keplr-wallet/stores-eth";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionRouter,
  InExtensionMessageRequester,
  InteractionAddon,
} from "@keplr-wallet/router-extension";
import { APP_PORT } from "@keplr-wallet/router";
import { FiatCurrency } from "@keplr-wallet/types";
import { UIConfigStore } from "./ui-config";
import { AnalyticsStore, NoopAnalyticsClient } from "@keplr-wallet/analytics";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { HugeQueriesStore } from "./huge-queries";
import { ExtensionAnalyticsClient } from "../analytics";
import { TokenContractsQueries } from "./token-contracts";
import {
  SkipQueries,
  Price24HChangesStore,
  SwapUsageQueries,
} from "@keplr-wallet/stores-internal";

export class RootStore {
  public readonly uiConfigStore: UIConfigStore;

  public readonly keyRingStore: KeyRingStore;
  public readonly chainStore: ChainStore;
  public readonly ibcChannelStore: IBCChannelStore;

  public readonly permissionManagerStore: PermissionManagerStore;

  public readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly signEthereumInteractionStore: SignEthereumInteractionStore;
  public readonly chainSuggestStore: ChainSuggestStore;
  public readonly icnsInteractionStore: ICNSInteractionStore;

  public readonly queriesStore: QueriesStore<
    [
      AgoricQueries,
      CosmosQueries,
      CosmwasmQueries,
      SecretQueries,
      OsmosisQueries,
      KeplrETCQueries,
      ICNSQueries,
      TokenContractsQueries,
      EthereumQueries
    ]
  >;
  public readonly swapUsageQueries: SwapUsageQueries;
  public readonly skipQueriesStore: SkipQueries;
  public readonly accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >;
  public readonly ethereumAccountStore: EthereumAccountStore;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly price24HChangesStore: Price24HChangesStore;
  public readonly hugeQueriesStore: HugeQueriesStore;

  public readonly tokensStore: TokensStore;

  public readonly tokenFactoryRegistrar: TokenFactoryCurrencyRegistrar;
  public readonly ibcCurrencyRegistrar: IBCCurrencyRegistrar;
  public readonly lsmCurrencyRegistrar: LSMCurrencyRegistrar;
  public readonly gravityBridgeCurrencyRegistrar: GravityBridgeCurrencyRegistrar;
  public readonly axelarEVMBridgeCurrencyRegistrar: AxelarEVMBridgeCurrencyRegistrar;
  public readonly erc20CurrencyRegistrar: ERC20CurrencyRegistrar;

  public readonly analyticsStore: AnalyticsStore;

  constructor() {
    const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
    router.addGuard(ContentScriptGuards.checkMessageIsInternal);

    // Initialize the interaction addon service.
    const interactionAddonService =
      new InteractionAddon.InteractionAddonService();
    InteractionAddon.init(router, interactionAddonService);

    this.permissionManagerStore = new PermissionManagerStore(
      new InExtensionMessageRequester()
    );

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new InExtensionMessageRequester()
    );

    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          window.dispatchEvent(new Event(type));
        },
      },
      new InExtensionMessageRequester()
    );

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      this.keyRingStore,
      new InExtensionMessageRequester()
    );

    this.ibcChannelStore = new IBCChannelStore(
      new ExtensionKVStore("store_ibc_channel"),
      this.chainStore
    );

    this.permissionStore = new PermissionStore(
      this.interactionStore,
      this.permissionManagerStore,
      new InExtensionMessageRequester()
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);
    this.signEthereumInteractionStore = new SignEthereumInteractionStore(
      this.interactionStore
    );
    this.chainSuggestStore = new ChainSuggestStore(
      this.interactionStore,
      CommunityChainInfoRepo
    );
    this.icnsInteractionStore = new ICNSInteractionStore(this.interactionStore);

    this.queriesStore = new QueriesStore(
      new ExtensionKVStore("store_queries"),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      AgoricQueries.use(),
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      SecretQueries.use({
        apiGetter: getKeplrFromWindow,
      }),
      OsmosisQueries.use(),
      KeplrETCQueries.use({
        ethereumURL: EthereumEndpoint,
      }),
      ICNSQueries.use(),
      TokenContractsQueries.use({
        tokenContractListURL: TokenContractListURL,
      }),
      EthereumQueries.use({
        coingeckoAPIBaseURL: CoinGeckoAPIEndPoint,
        coingeckoAPIURI: CoinGeckoCoinDataByTokenAddress,
      })
    );
    this.swapUsageQueries = new SwapUsageQueries(
      this.queriesStore.sharedContext,
      process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"]
    );
    this.skipQueriesStore = new SkipQueries(
      this.queriesStore.sharedContext,
      this.chainStore,
      this.swapUsageQueries,
      SwapVenue
    );

    this.accountStore = new AccountStore(
      window,
      this.chainStore,
      getKeplrFromWindow,
      () => {
        return {
          suggestChain: false,
          autoInit: true,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: (chainId) => {
          // In certik, change the msg type of the MsgSend to "bank/MsgSend"
          if (chainId.startsWith("shentu-")) {
            return {
              send: {
                native: {
                  type: "bank/MsgSend",
                },
              },
            };
          }

          // In akash or sifchain, increase the default gas for sending
          if (
            chainId.startsWith("akashnet-") ||
            chainId.startsWith("sifchain")
          ) {
            return {
              send: {
                native: {
                  gas: 120000,
                },
              },
            };
          }

          if (chainId.startsWith("secret-")) {
            return {
              send: {
                native: {
                  gas: 20000,
                },
              },
              withdrawRewards: {
                gas: 25000,
              },
            };
          }

          // For terra related chains
          if (
            chainId.startsWith("bombay-") ||
            chainId.startsWith("columbus-")
          ) {
            return {
              send: {
                native: {
                  type: "bank/MsgSend",
                },
              },
              withdrawRewards: {
                type: "distribution/MsgWithdrawDelegationReward",
              },
            };
          }

          if (chainId.startsWith("evmos_") || chainId.startsWith("planq_")) {
            return {
              send: {
                native: {
                  gas: 140000,
                },
              },
              withdrawRewards: {
                gas: 200000,
              },
            };
          }

          if (chainId.startsWith("osmosis")) {
            return {
              send: {
                native: {
                  gas: 100000,
                },
              },
              withdrawRewards: {
                gas: 300000,
              },
            };
          }

          if (chainId.startsWith("stargaze-")) {
            return {
              send: {
                native: {
                  gas: 100000,
                },
              },
              withdrawRewards: {
                gas: 200000,
              },
            };
          }
        },
      }),
      CosmwasmAccount.use({
        queriesStore: this.queriesStore,
      }),
      SecretAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: (chainId) => {
          if (chainId.startsWith("secret-")) {
            return {
              send: {
                secret20: {
                  gas: 175000,
                },
              },
              createSecret20ViewingKey: {
                gas: 175000,
              },
            };
          }
        },
      })
    );

    this.ethereumAccountStore = new EthereumAccountStore(
      this.chainStore,
      getKeplrFromWindow
    );

    this.priceStore = new CoinGeckoPriceStore(
      new ExtensionKVStore("store_prices"),
      FiatCurrencies.reduce<{
        [vsCurrency: string]: FiatCurrency;
      }>((obj, fiat) => {
        obj[fiat.currency] = fiat;
        return obj;
      }, {}),
      "usd",
      {
        baseURL: CoinGeckoAPIEndPoint,
        uri: CoinGeckoGetPrice,
      }
    );
    this.price24HChangesStore = new Price24HChangesStore(
      new ExtensionKVStore("store_prices_changes_24h"),
      {
        baseURL: process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
        uri: "/price/changes/24h",
      }
    );

    this.hugeQueriesStore = new HugeQueriesStore(
      this.chainStore,
      this.queriesStore,
      this.accountStore,
      this.priceStore
    );

    this.uiConfigStore = new UIConfigStore(
      {
        kvStore: new ExtensionKVStore("store_ui_config"),
        addressBookKVStore: new ExtensionKVStore("address-book"),
      },
      new InExtensionMessageRequester(),
      this.chainStore,
      this.keyRingStore,
      this.priceStore,
      ICNSInfo
    );

    this.tokensStore = new TokensStore(
      window,
      new InExtensionMessageRequester(),
      this.chainStore,
      this.accountStore,
      this.keyRingStore,
      this.interactionStore
    );

    this.tokenFactoryRegistrar = new TokenFactoryCurrencyRegistrar(
      new ExtensionKVStore("store_token_factory_currency_registrar"),
      24 * 3600 * 1000,
      process.env["KEPLR_EXT_TOKEN_FACTORY_BASE_URL"] || "",
      process.env["KEPLR_EXT_TOKEN_FACTORY_URI"] || "",
      this.chainStore,
      this.queriesStore
    );
    this.ibcCurrencyRegistrar = new IBCCurrencyRegistrar(
      new ExtensionKVStore("store_ibc_curreny_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.accountStore,
      this.queriesStore
    );
    this.lsmCurrencyRegistrar = new LSMCurrencyRegistrar(
      new ExtensionKVStore("store_lsm_currency_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.queriesStore
    );
    this.gravityBridgeCurrencyRegistrar = new GravityBridgeCurrencyRegistrar(
      new ExtensionKVStore("store_gravity_bridge_currency_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.queriesStore
    );
    this.axelarEVMBridgeCurrencyRegistrar =
      new AxelarEVMBridgeCurrencyRegistrar(
        new ExtensionKVStore("store_axelar_evm_bridge_currency_registrar"),
        24 * 3600 * 1000,
        this.chainStore,
        this.queriesStore,
        "ethereum"
      );
    this.erc20CurrencyRegistrar = new ERC20CurrencyRegistrar(
      new ExtensionKVStore("store_erc20_currency_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.queriesStore
    );

    // XXX: Remember that userId would be set by `StoreProvider`
    this.analyticsStore = new AnalyticsStore(
      (() => {
        if (
          !GoogleAPIKeyForMeasurement ||
          !GoogleMeasurementId ||
          localStorage.getItem("disable-analytics") === "true"
        ) {
          return new NoopAnalyticsClient();
        } else {
          return new ExtensionAnalyticsClient(
            new ExtensionKVStore("store_google_analytics_client"),
            GoogleAPIKeyForMeasurement,
            GoogleMeasurementId
          );
        }
      })(),
      {
        logEvent: (eventName, eventProperties) => {
          if (eventProperties?.["chainId"] || eventProperties?.["chainIds"]) {
            eventProperties = {
              ...eventProperties,
            };

            if (eventProperties["chainId"]) {
              eventProperties["chainIdentifier"] = ChainIdHelper.parse(
                eventProperties["chainId"] as string
              ).identifier;
            }

            if (eventProperties["chainIds"]) {
              eventProperties["chainIdentifiers"] = (
                eventProperties["chainIds"] as string[]
              ).map((chainId) => ChainIdHelper.parse(chainId).identifier);
            }
          }

          return {
            eventName,
            eventProperties,
          };
        },
      }
    );

    router.listen(APP_PORT);
  }
}

export function createRootStore() {
  return new RootStore();
}
