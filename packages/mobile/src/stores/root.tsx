import { EmbedChainInfos } from "../config";
import {
  ChainStore,
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
} from "@keplr-wallet/stores";
import { MemoryKVStore } from "@keplr-wallet/common";
import { APP_PORT } from "@keplr-wallet/router";
import { RNEnv, RNRouter } from "../router";
import { RNMessageRequester } from "../router/requester";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;

  protected readonly interactionStore: InteractionStore;

  public readonly queriesStore: QueriesStore;
  public readonly accountStore: AccountStore;
  public readonly priceStore: CoinGeckoPriceStore;

  constructor() {
    const router = new RNRouter(RNEnv.produceEnv);

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new RNMessageRequester()
    );

    this.chainStore = new ChainStore(EmbedChainInfos);

    this.keyRingStore = new KeyRingStore(
      this.chainStore,
      new RNMessageRequester(),
      this.interactionStore
    );

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("store_queries"),
      this.chainStore
    );

    this.accountStore = new AccountStore(this.chainStore, this.queriesStore);

    this.priceStore = new CoinGeckoPriceStore(
      new MemoryKVStore("store_prices"),
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
