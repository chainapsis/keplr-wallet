import { EmbedChainInfos, EthereumEndpoint } from "../config";
import {
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
  SignInteractionStore,
  TokensStore,
  CosmosQueries,
  CosmwasmQueries,
  SecretQueries,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
  LedgerInitStore,
  IBCCurrencyRegsitrar,
  PermissionStore,
  ChainSuggestStore,
} from "@keplr-wallet/stores";
import { AsyncKVStore } from "../common";
import { APP_PORT } from "@keplr-wallet/router";
import { ChainInfoWithEmbed } from "@keplr-wallet/background";
import { RNEnv, RNRouterUI, RNMessageRequesterInternal } from "../router";
import { ChainStore } from "./chain";
import EventEmitter from "eventemitter3";
import { Keplr } from "@keplr-wallet/provider";
import { KeychainStore } from "./keychain";
import { WalletConnectStore } from "./wallet-connect";
import { FeeType } from "@keplr-wallet/hooks";
import { AmplitudeApiKey } from "../config";
import { AnalyticsStore, NoopAnalyticsClient } from "@keplr-wallet/analytics";
import { Amplitude } from "@amplitude/react-native";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import {
  AxelarEVMBridgeCurrencyRegistrar,
  GravityBridgeCurrencyRegsitrar,
  KeplrETCQueries,
} from "@keplr-wallet/stores-etc";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;

  protected readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly ledgerInitStore: LedgerInitStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly chainSuggestStore: ChainSuggestStore;

  public readonly queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]
  >;
  public readonly accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly tokensStore: TokensStore<ChainInfoWithEmbed>;

  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithEmbed>;
  protected readonly gravityBridgeCurrencyRegistrar: GravityBridgeCurrencyRegsitrar<ChainInfoWithEmbed>;
  protected readonly axelarEVMBridgeCurrencyRegistrar: AxelarEVMBridgeCurrencyRegistrar<ChainInfoWithEmbed>;

  public readonly keychainStore: KeychainStore;
  public readonly walletConnectStore: WalletConnectStore;

  public readonly analyticsStore: AnalyticsStore<
    {
      chainId?: string;
      chainName?: string;
      toChainId?: string;
      toChainName?: string;
      registerType?: "seed" | "google" | "apple" | "ledger" | "qr";
      feeType?: FeeType | undefined;
      isIbc?: boolean;
      validatorName?: string;
      toValidatorName?: string;
      proposalId?: string;
      proposalTitle?: string;
    },
    {
      registerType?: "seed" | "google" | "ledger" | "qr" | "apple";
      accountType?: "mnemonic" | "privateKey" | "ledger";
      currency?: string;
      language?: string;
    }
  >;

  constructor() {
    const router = new RNRouterUI(RNEnv.produceEnv);

    const eventEmitter = new EventEmitter();

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new RNMessageRequesterInternal()
    );
    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new RNMessageRequesterInternal()
    );
    this.ledgerInitStore = new LedgerInitStore(
      this.interactionStore,
      new RNMessageRequesterInternal()
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);
    this.chainSuggestStore = new ChainSuggestStore(this.interactionStore);

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new RNMessageRequesterInternal(),
      new AsyncKVStore("store_chains")
    );

    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          eventEmitter.emit(type);
        },
      },
      "pbkdf2",
      0,
      this.chainStore,
      new RNMessageRequesterInternal(),
      this.interactionStore
    );

    this.queriesStore = new QueriesStore(
      // Fix prefix key because there was a problem with storage being corrupted.
      // In the case of storage where the prefix key is "store_queries" or "store_queries_fix", "store_queries_fix2",
      // we should not use it because it is already corrupted in some users.
      // https://github.com/chainapsis/keplr-wallet/issues/275
      // https://github.com/chainapsis/keplr-wallet/issues/278
      // https://github.com/chainapsis/keplr-wallet/issues/318
      new AsyncKVStore("store_queries_fix3"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      SecretQueries.use({
        apiGetter: async () => {
          // TOOD: Set version for Keplr API
          return new Keplr("", "core", new RNMessageRequesterInternal());
        },
      }),
      KeplrETCQueries.use({
        ethereumURL: EthereumEndpoint,
      })
    );

    this.accountStore = new AccountStore(
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => void) => {
          eventEmitter.removeListener(type, fn);
        },
      },
      this.chainStore,
      () => {
        return {
          suggestChain: false,
          autoInit: true,
          getKeplr: async () => {
            // TOOD: Set version for Keplr API
            return new Keplr("", "core", new RNMessageRequesterInternal());
          },
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: (chainId) => {
          if (chainId.startsWith("osmosis")) {
            return {
              send: {
                native: {
                  gas: 100000,
                },
              },
              undelegate: {
                gas: 350000,
              },
              redelegate: {
                gas: 550000,
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
      })
    );

    this.priceStore = new CoinGeckoPriceStore(
      new AsyncKVStore("store_prices"),
      {
        usd: {
          currency: "usd",
          symbol: "$",
          maxDecimals: 2,
          locale: "en-US",
        },
        eur: {
          currency: "eur",
          symbol: "€",
          maxDecimals: 2,
          locale: "de-DE",
        },
        gbp: {
          currency: "gbp",
          symbol: "£",
          maxDecimals: 2,
          locale: "en-GB",
        },
        cad: {
          currency: "cad",
          symbol: "CA$",
          maxDecimals: 2,
          locale: "en-CA",
        },
        rub: {
          currency: "rub",
          symbol: "₽",
          maxDecimals: 0,
          locale: "ru",
        },
        krw: {
          currency: "krw",
          symbol: "₩",
          maxDecimals: 0,
          locale: "ko-KR",
        },
        hkd: {
          currency: "hkd",
          symbol: "HK$",
          maxDecimals: 1,
          locale: "en-HK",
        },
        cny: {
          currency: "cny",
          symbol: "¥",
          maxDecimals: 1,
          locale: "zh-CN",
        },
        jpy: {
          currency: "jpy",
          symbol: "¥",
          maxDecimals: 0,
          locale: "ja-JP",
        },
      },
      "usd"
    );

    this.tokensStore = new TokensStore(
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
      },
      this.chainStore,
      new RNMessageRequesterInternal(),
      this.interactionStore
    );

    this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfoWithEmbed>(
      new AsyncKVStore("store_test_ibc_currency_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      this.queriesStore
    );

    this.gravityBridgeCurrencyRegistrar = new GravityBridgeCurrencyRegsitrar(
      new AsyncKVStore("store_gravity_bridge_currency_registrar"),
      this.chainStore,
      this.queriesStore
    );
    this.axelarEVMBridgeCurrencyRegistrar = new AxelarEVMBridgeCurrencyRegistrar<ChainInfoWithEmbed>(
      new AsyncKVStore("store_axelar_evm_bridge_currency_registrar"),
      this.chainStore,
      this.queriesStore,
      "ethereum"
    );

    router.listen(APP_PORT);

    this.keychainStore = new KeychainStore(
      new AsyncKVStore("store_keychain"),
      this.keyRingStore
    );

    this.walletConnectStore = new WalletConnectStore(
      new AsyncKVStore("store_wallet_connect"),
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => void) => {
          eventEmitter.removeListener(type, fn);
        },
      },
      this.chainStore,
      this.keyRingStore,
      this.permissionStore
    );

    this.analyticsStore = new AnalyticsStore(
      (() => {
        if (!AmplitudeApiKey) {
          return new NoopAnalyticsClient();
        } else {
          const amplitudeClient = Amplitude.getInstance();
          amplitudeClient.init(AmplitudeApiKey);

          return amplitudeClient;
        }
      })(),
      {
        logEvent: (eventName, eventProperties) => {
          if (eventProperties?.chainId || eventProperties?.toChainId) {
            eventProperties = {
              ...eventProperties,
            };

            if (eventProperties.chainId) {
              eventProperties.chainId = ChainIdHelper.parse(
                eventProperties.chainId
              ).identifier;
            }

            if (eventProperties.toChainId) {
              eventProperties.toChainId = ChainIdHelper.parse(
                eventProperties.toChainId
              ).identifier;
            }
          }

          return {
            eventName,
            eventProperties,
          };
        },
      }
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
