import { ObservableQuery, QueryResponse } from "../common";
import { CoinGeckoSimplePrice } from "./types";
import Axios, { CancelToken } from "axios";
import { KVStore } from "@keplr-wallet/common";
import { Dec, CoinPretty, Int } from "@keplr-wallet/unit";
import { FiatCurrency } from "@keplr-wallet/types";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";
import { DeepReadonly } from "utility-types";
import deepmerge from "deepmerge";

export class CoinGeckoPriceStore extends ObservableQuery<CoinGeckoSimplePrice> {
  protected coinIds: string[];
  protected vsCurrencies: string[];

  protected _supportedVsCurrencies: {
    [vsCurrency: string]: FiatCurrency | undefined;
  };

  constructor(
    kvStore: KVStore,
    supportedVsCurrencies: {
      [vsCurrency: string]: FiatCurrency;
    }
  ) {
    const instance = Axios.create({
      baseURL: "https://api.coingecko.com/api/v3",
    });

    super(kvStore, instance, "/simple/price");

    this.coinIds = [];
    this.vsCurrencies = [];

    this._supportedVsCurrencies = supportedVsCurrencies;
  }

  get supportedVsCurrencies(): DeepReadonly<{
    [vsCurrency: string]: FiatCurrency | undefined;
  }> {
    return this._supportedVsCurrencies;
  }

  getFiatCurrency(currency: string): FiatCurrency | undefined {
    return this._supportedVsCurrencies[currency];
  }

  protected canFetch(): boolean {
    return this.coinIds.length > 0 && this.vsCurrencies.length > 0;
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<CoinGeckoSimplePrice>> {
    const response = await super.fetchResponse(cancelToken);
    // Because this store only queries the price of the tokens that have been requested from start,
    // it will remove the prior prices that have not been requested to just return the fetching result.
    // So, to prevent this problem, merge the prior response and current response with retaining the prior response's price.
    return {
      ...response,
      ...{
        data: deepmerge(this.response ? this.response.data : {}, response.data),
      },
    };
  }

  protected refetch() {
    const url = `/simple/price?ids=${this.coinIds.join(
      ","
    )}&vs_currencies=${this.vsCurrencies.join(",")}`;

    this.setUrl(url);
  }

  protected getCacheKey(): string {
    // Because the uri of the coingecko would be changed according to the coin ids and vsCurrencies.
    // Therefore, just using the uri as the cache key is not useful.
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }${this.instance.getUri({
      url: "/simple/price",
    })}`;
  }

  getPrice(coinId: string, vsCurrency: string): number | undefined {
    if (!this.supportedVsCurrencies[vsCurrency]) {
      return undefined;
    }

    if (
      !this.coinIds.includes(coinId) ||
      !this.vsCurrencies.includes(vsCurrency)
    ) {
      if (!this.coinIds.includes(coinId)) {
        this.coinIds.push(coinId);
      }

      if (!this.vsCurrencies.includes(vsCurrency)) {
        this.vsCurrencies.push(vsCurrency);
      }

      this.refetch();
    }

    if (!this.response) {
      return undefined;
    }

    const coinPrices = this.response.data[coinId];
    if (!coinPrices) {
      return undefined;
    }
    return coinPrices[vsCurrency];
  }

  calculatePrice(
    vsCurrrency: string,
    coin: CoinPretty
  ): PricePretty | undefined {
    if (!coin.currency.coinGeckoId) {
      return undefined;
    }

    const fiatCurrency = this.supportedVsCurrencies[vsCurrrency];
    if (!fiatCurrency) {
      return undefined;
    }

    const price = this.getPrice(coin.currency.coinGeckoId, vsCurrrency);
    if (price === undefined) {
      return new PricePretty(fiatCurrency, new Int(0)).ready(false);
    }

    const dec = coin.toDec();
    const priceDec = new Dec(price.toString());

    return new PricePretty(fiatCurrency, dec.mul(priceDec));
  }
}
