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
  CoinGeckoCoinDataByTokenAddress,
  SwapVenues,
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
  NobleQueries,
  NobleAccount,
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
  SignStarknetTxInteractionStore,
  SignStarknetMessageInteractionStore,
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
import { setInteractionDataHref } from "../utils";
import { InteractionPingMsg } from "@keplr-wallet/background";
import {
  StarknetAccountStore,
  StarknetQueriesStore,
} from "@keplr-wallet/stores-starknet";

let _sidePanelWindowId: number | undefined;
async function getSidePanelWindowId(): Promise<number | undefined> {
  if (_sidePanelWindowId != null) {
    return _sidePanelWindowId;
  }

  const current = await browser.windows.getCurrent();
  _sidePanelWindowId = current.id;
  return _sidePanelWindowId;
}
// 실행되는 순간 바로 window id를 초기화한다.
// 현재 실행되는 ui의 window id를 알아내야 하는데
// 문제는 extension api에 그런 기능을 찾을수가 없다.
// 대충 유저가 사용하고 있는 window에서 side panel이 열리는게 당연하니
// 일단 이렇게 처리한다.
getSidePanelWindowId();

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
  public readonly signStarknetTxInteractionStore: SignStarknetTxInteractionStore;
  public readonly signStarknetMessageInteractionStore: SignStarknetMessageInteractionStore;
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
      EthereumQueries,
      NobleQueries
    ]
  >;
  public readonly swapUsageQueries: SwapUsageQueries;
  public readonly skipQueriesStore: SkipQueries;
  public readonly starknetQueriesStore: StarknetQueriesStore;
  public readonly accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount, NobleAccount]
  >;
  public readonly ethereumAccountStore: EthereumAccountStore;
  public readonly starknetAccountStore: StarknetAccountStore;
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
    const router = new ExtensionRouter(ContentScriptEnv.produceEnv, (msg) => {
      // background에서 ping을 보낼때
      // side panel이라면 window id를 구분해야한다.
      // 하지만 이게 기존의 message system이 sender/receiver가 한개씩만 존재한다고 생각하고 만들었기 때문에
      // background에서 여러 side panel에 ping을 보낼수는 없다. (보낼수는 있는데 sender에서 반환되는 값은 단순히 가장 먼저 반응한 receiver의 결과일 뿐이다...)
      // 이 문제를 최소한의 변화로 해결하기 위해서
      // side panel일 경우 ping message를 받았을때 window id를 체크해서 원하는 값이 아니라면 무시하도록 한다.
      // XXX: _sidePanelWindowId는 처음에 undefined일 수 있다.
      //      근데 그렇다고 이 함수를 promise로 바꾸는건 router 쪽에서 큰 변화가 필요하기 때문에
      //      당장은 이 문제는 무시하도록 한다. _sidePanelWindowId의 값이 설정되는건 처음에 매우 빠를 것이고
      //      background에서 이 ping msg를 보내는 것 자체가 interval로 보내면서 확인하는 용도이기 때문에
      //      큰 문제가 되지는 않을 것이다.
      if (
        msg instanceof InteractionPingMsg &&
        !msg.ignoreWindowIdAndForcePing
      ) {
        const url = new URL(window.location.href);
        if (url.pathname === "/sidePanel.html") {
          if (_sidePanelWindowId == null) {
            return true;
          }
          return msg.windowId !== _sidePanelWindowId;
        }
      }

      return false;
    });
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
      new InExtensionMessageRequester(),
      (next) => {
        if (next) {
          // TODO: 여기서 internal과 external인 경우를 구분할 필요가 있다.
          //       사실 일반 유저의 interaction으로는 internal과 external이 섞이지 않을 것 같긴 하지만...
          //       로직의 엄밀함을 위해서는 처리할 필요가 있어보인다.
          setInteractionDataHref(next);
        }
      },
      async (data) => {
        const url = new URL(window.location.href);
        // popup 또는 side panel에서만 interaction을 처리할 수 있다...
        // XXX: register.html 등에서는 interaction을 처리할 수 없기 때문에
        //      이러한 경우를 막기 위해서 여기서 pathname을 확실하게 확인해야한다.
        if (url.pathname === "/popup.html") {
          // popup이면 케플러가 여러 window 상에 동시에 존재하는게 힘들기 때문에 다 받아준다.
          return data;
        }
        if (url.pathname === "/sidePanel.html") {
          // side panel일 경우 window id도 동일해야한다.
          // 유저가 window를 여러개 킨 상태로 각 window에서 side panel을 열어놨다고 생각해보자...
          const windowId = await getSidePanelWindowId();
          return data.filter((d) => d.windowId === windowId);
        }
        return [];
      },
      (old, fresh) => {
        // interaction에 대한 요청이 생기면 uri를 바꿔줘야한다...
        // side panel의 경우 background에서 uri를 설정할 수 없기 때문에 이 방식이 필수이다.
        // popup의 경우도 side panel 기능이 추가되면서 background에서 uri를 설정할 수 없도록 바꿨기 때문에 이 방식이 필요하다.
        // internal의 경우 background에서 uri를 바꿔버리지만 어차피 밑의 처리에서도 동일한 uri가 나올 것이기 때문에 아무것도 안한것과 같아서 괜찮다.
        if (old.length === 0 && fresh.length > 0) {
          // TODO: 여기서 internal과 external인 경우를 구분할 필요가 있다.
          //       사실 일반 유저의 interaction으로는 internal과 external이 섞이지 않을 것 같긴 하지만...
          //       로직의 엄밀함을 위해서는 처리할 필요가 있어보인다.
          setInteractionDataHref(fresh[0]);
        }
      },
      async (windowId: number | undefined, ignoreWindowIdAndForcePing) => {
        const url = new URL(window.location.href);
        // popup 또는 side panel에서만 interaction을 처리할 수 있다...
        // interaction을 처리할 수 있는 UI가 존재하는 경우
        // background의 interaction service에 처리할 수 있는 UI가 있다고 알려준다.
        // XXX: register.html 등에서는 interaction을 처리할 수 없기 때문에
        //      이러한 경우를 막기 위해서 여기서 pathname을 확실하게 확인해야한다.
        if (url.pathname === "/popup.html") {
          return true;
        }
        if (url.pathname === "/sidePanel.html") {
          if (ignoreWindowIdAndForcePing) {
            return true;
          }
          // side panel일 경우 window id도 동일해야한다.
          // 유저가 window를 여러개 킨 상태로 각 window에서 side panel을 열어놨다고 생각해보자...
          return windowId === (await getSidePanelWindowId());
        }

        return false;
      }
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
    this.signStarknetTxInteractionStore = new SignStarknetTxInteractionStore(
      this.interactionStore
    );
    this.signStarknetMessageInteractionStore =
      new SignStarknetMessageInteractionStore(this.interactionStore);
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
      }),
      NobleQueries.use()
    );
    this.swapUsageQueries = new SwapUsageQueries(
      this.queriesStore.sharedContext,
      process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"]
    );
    this.skipQueriesStore = new SkipQueries(
      this.queriesStore.sharedContext,
      this.chainStore,
      this.swapUsageQueries,
      SwapVenues
    );
    this.starknetQueriesStore = new StarknetQueriesStore(
      this.queriesStore.sharedContext,
      this.chainStore,
      TokenContractListURL
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

          if (chainId.startsWith("thorchain-")) {
            return {
              send: {
                native: {
                  type: "thorchain/MsgSend",
                },
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
      }),
      NobleAccount.use({
        queriesStore: this.queriesStore,
      })
    );

    this.ethereumAccountStore = new EthereumAccountStore(
      this.chainStore,
      getKeplrFromWindow
    );
    this.starknetAccountStore = new StarknetAccountStore(
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
      this.starknetQueriesStore,
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
