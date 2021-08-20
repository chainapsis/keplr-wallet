import { EmbedChainInfos } from "../config";
import {
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
  SignInteractionStore,
  TokensStore,
  QueriesWithCosmosAndSecret,
  AccountWithCosmosAndSecret,
  LedgerInitStore,
  IBCCurrencyRegsitrar,
} from "@keplr-wallet/stores";
import { AsyncKVStore } from "../common";
import { APP_PORT } from "@keplr-wallet/router";
import { ChainInfoWithEmbed } from "@keplr-wallet/background";
import { RNEnv, RNRouterUI, RNMessageRequesterInternal } from "../router";
import { InteractionModalStore } from "./interaction-modal";
import { ChainStore } from "./chain";
import EventEmitter from "eventemitter3";
import { Keplr } from "@keplr-wallet/provider";
import { KeychainStore } from "./keychain";
import { WalletConnectStore } from "./wallet-connect";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;

  public readonly interactionModalStore: InteractionModalStore;
  protected readonly interactionStore: InteractionStore;
  public readonly ledgerInitStore: LedgerInitStore;
  public readonly signInteractionStore: SignInteractionStore;

  public readonly queriesStore: QueriesStore<QueriesWithCosmosAndSecret>;
  public readonly accountStore: AccountStore<AccountWithCosmosAndSecret>;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly tokensStore: TokensStore<ChainInfoWithEmbed>;

  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithEmbed>;

  public readonly keychainStore: KeychainStore;
  public readonly walletConnectStore: WalletConnectStore;

  constructor() {
    const router = new RNRouterUI(RNEnv.produceEnv);

    const eventEmitter = new EventEmitter();

    this.interactionModalStore = new InteractionModalStore();
    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new RNMessageRequesterInternal()
    );
    this.ledgerInitStore = new LedgerInitStore(
      this.interactionStore,
      new RNMessageRequesterInternal()
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new RNMessageRequesterInternal()
    );

    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          eventEmitter.emit(type);
        },
      },
      "sha256",
      this.chainStore,
      new RNMessageRequesterInternal(),
      this.interactionStore
    );

    this.queriesStore = new QueriesStore(
      new AsyncKVStore("store_queries"),
      this.chainStore,
      async () => {
        // TOOD: Set version for Keplr API
        return new Keplr("", new RNMessageRequesterInternal());
      },
      QueriesWithCosmosAndSecret
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
      AccountWithCosmosAndSecret,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          prefetching: true,
          suggestChain: false,
          autoInit: true,
          getKeplr: async () => {
            return new Keplr("", new RNMessageRequesterInternal());
          },
        },
      }
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
      this.chainStore,
      this.accountStore,
      this.queriesStore
    );

    router.listen(APP_PORT);

    this.keychainStore = new KeychainStore(
      new AsyncKVStore("keychain"),
      this.keyRingStore
    );

    this.walletConnectStore = new WalletConnectStore(
      this.chainStore,
      this.accountStore
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
