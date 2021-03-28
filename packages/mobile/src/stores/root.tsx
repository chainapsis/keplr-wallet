import { EmbedChainInfos } from "../config";
import {
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
  SignInteractionStore,
} from "@keplr-wallet/stores";
import { AsyncKVStore } from "../common";
import { APP_PORT } from "@keplr-wallet/router";
import { RNEnv, RNRouter, RNMessageRequester } from "../router";
import { InteractionModalStore } from "./interaction-modal";
import { ChainStore } from "./chain";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;

  public readonly interactionModalStore: InteractionModalStore;
  protected readonly interactionStore: InteractionStore;
  public readonly signInteractionStore: SignInteractionStore;

  public readonly queriesStore: QueriesStore;
  public readonly accountStore: AccountStore;
  public readonly priceStore: CoinGeckoPriceStore;

  constructor() {
    const router = new RNRouter(RNEnv.produceEnv);

    this.interactionModalStore = new InteractionModalStore();
    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new RNMessageRequester()
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);

    this.chainStore = new ChainStore(EmbedChainInfos, new RNMessageRequester());

    this.keyRingStore = new KeyRingStore(
      this.chainStore,
      new RNMessageRequester(),
      this.interactionStore
    );

    this.queriesStore = new QueriesStore(
      new AsyncKVStore("store_queries"),
      this.chainStore
    );

    this.accountStore = new AccountStore(this.chainStore, this.queriesStore);

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
      }
    );

    router.listen(APP_PORT);
  }
}

export function createRootStore() {
  return new RootStore();
}
