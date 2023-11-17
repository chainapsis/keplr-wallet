import { ObservableQuery, QuerySharedContext } from "../common";
import { CoinGeckoSimplePrice } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { Dec, CoinPretty, Int, PricePretty } from "@keplr-wallet/unit";
import { FiatCurrency } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import deepmerge from "deepmerge";
import { action, autorun, makeObservable, observable } from "mobx";
import { makeURL } from "@keplr-wallet/simple-fetch";

class Throttler {
  protected fns: (() => void)[] = [];

  private timeoutId?: NodeJS.Timeout;

  constructor(public readonly duration: number) {}

  call(fn: () => void) {
    if (this.duration <= 0) {
      fn();
      return;
    }

    this.fns.push(fn);

    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(this.callback, this.duration);
  }

  protected callback = () => {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    if (this.fns.length > 0) {
      const fn = this.fns[this.fns.length - 1];
      fn();

      this.fns = [];
    }
  };
}

class SortedSetStorage {
  protected array: string[] = [];
  protected map: Record<string, boolean | undefined> = {};

  protected restored: Record<string, boolean | undefined> = {};
  protected isRestored: boolean = false;

  protected kvStore: KVStore;
  protected storeKey: string = "";

  protected throttler: Throttler;

  constructor(
    kvStore: KVStore,
    storeKey: string,
    throttleDuration: number = 0
  ) {
    if (!storeKey) {
      throw new Error("Empty store key");
    }

    this.kvStore = kvStore;
    this.storeKey = storeKey;

    this.throttler = new Throttler(throttleDuration);
  }

  has(value: string): boolean {
    return this.map[value] === true;
  }

  add(...values: string[]): boolean {
    let forceSave = false;
    let unknowns: string[] = [];
    for (const value of values) {
      if (this.isRestored) {
        if (this.restored[value]) {
          forceSave = true;
          delete this.restored[value];
        }
      }

      if (!this.has(value)) {
        unknowns.push(value);
      }
    }
    if (unknowns.length === 0) {
      if (this.isRestored && forceSave) {
        // No need to wait
        this.throttler.call(() => this.save());
      }

      return false;
    }
    // Remove duplicated.
    unknowns = [...new Set(unknowns)];

    for (const unknown of unknowns) {
      this.map[unknown] = true;
    }

    let newArray = this.array.slice().concat(unknowns);
    newArray = newArray.sort((id1, id2) => {
      return id1 < id2 ? -1 : 1;
    });

    this.array = newArray;

    if (this.isRestored) {
      // No need to wait
      this.throttler.call(() => this.save());
    }

    return true;
  }

  get values(): string[] {
    return this.array.slice();
  }

  async save(): Promise<void> {
    await this.kvStore.set(
      this.storeKey,
      this.array.filter((value) => !this.restored[value])
    );
  }

  async restore(): Promise<void> {
    const saved = await this.kvStore.get<string[]>(this.storeKey);
    if (saved) {
      for (const value of saved) {
        this.restored[value] = true;
      }
      for (const value of this.array) {
        if (this.restored[value]) {
          delete this.restored[value];
        }
      }

      this.add(...saved);
    }

    this.isRestored = true;
  }
}

export class CoinGeckoPriceStore extends ObservableQuery<CoinGeckoSimplePrice> {
  protected _isInitialized: boolean;

  private _coinIds: SortedSetStorage;
  private _vsCurrencies: SortedSetStorage;

  @observable
  protected _defaultVsCurrency: string;

  protected _supportedVsCurrencies: {
    [vsCurrency: string]: FiatCurrency | undefined;
  };

  protected _throttler: Throttler;

  protected _optionUri: string;

  constructor(
    protected readonly kvStore: KVStore,
    supportedVsCurrencies: {
      [vsCurrency: string]: FiatCurrency;
    },
    defaultVsCurrency: string,
    options: {
      readonly baseURL?: string;
      readonly uri?: string;

      // Default is 250ms
      readonly throttleDuration?: number;
    } = {}
  ) {
    super(
      new QuerySharedContext(kvStore, {
        responseDebounceMs: 0,
      }),
      options.baseURL || "https://api.coingecko.com/api/v3",
      options.uri || "/simple/price"
    );
    this._optionUri = options.uri || "/simple/price";

    this._isInitialized = false;

    const throttleDuration = options.throttleDuration ?? 250;

    this._coinIds = new SortedSetStorage(
      kvStore,
      "__coin_ids",
      throttleDuration
    );
    this._vsCurrencies = new SortedSetStorage(
      kvStore,
      "__vs_currencies",
      throttleDuration
    );
    this._defaultVsCurrency = defaultVsCurrency;

    this._supportedVsCurrencies = supportedVsCurrencies;

    this._throttler = new Throttler(throttleDuration);

    makeObservable(this);

    this.init();
  }

  protected override onStart(): Promise<void> {
    super.onStart();

    return this.waitUntilInitialized();
  }

  async init() {
    if (this._isInitialized) {
      return;
    }

    // Prefetch staled response
    await this.loadStabledResponse();

    await Promise.all([this._coinIds.restore(), this._vsCurrencies.restore()]);

    // No need to wait
    this._coinIds.save();
    this._vsCurrencies.save();

    this.updateURL([], [], true);

    this._isInitialized = true;
  }

  protected async waitUntilInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (this.isInitialized) {
          resolve();

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get defaultVsCurrency(): string {
    return this._defaultVsCurrency;
  }

  @action
  setDefaultVsCurrency(defaultVsCurrency: string) {
    this._defaultVsCurrency = defaultVsCurrency;
  }

  get supportedVsCurrencies(): DeepReadonly<{
    [vsCurrency: string]: FiatCurrency | undefined;
  }> {
    return this._supportedVsCurrencies;
  }

  getFiatCurrency(currency: string): FiatCurrency | undefined {
    return this._supportedVsCurrencies[currency];
  }

  protected override canFetch(): boolean {
    return (
      this._coinIds.values.length > 0 && this._vsCurrencies.values.length > 0
    );
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: CoinGeckoSimplePrice }> {
    const { data, headers } = await super.fetchResponse(abortController);
    // Because this store only queries the price of the tokens that have been requested from start,
    // it will remove the prior prices that have not been requested to just return the fetching result.
    // So, to prevent this problem, merge the prior response and current response with retaining the prior response's price.
    return {
      headers,
      data: deepmerge(this.response ? this.response.data : {}, data),
    };
  }

  protected updateURL(
    coinIds: string[],
    vsCurrencies: string[],
    forceSetUrl: boolean = false
  ) {
    const coinIdsUpdated = this._coinIds.add(...coinIds);
    const vsCurrenciesUpdated = this._vsCurrencies.add(...vsCurrencies, "usd");

    if (coinIdsUpdated || vsCurrenciesUpdated || forceSetUrl) {
      const url = `${this._optionUri}?ids=${this._coinIds.values.join(
        ","
      )}&vs_currencies=${this._vsCurrencies.values.join(",")}`;

      if (!this._isInitialized) {
        this.setUrl(url);
      } else {
        this._throttler.call(() => this.setUrl(url));
      }
    }
  }

  protected override getCacheKey(): string {
    // Because the uri of the coingecko would be changed according to the coin ids and vsCurrencies.
    // Therefore, just using the uri as the cache key is not useful.
    return makeURL(this.baseURL, this._optionUri);
  }

  getPrice(coinId: string, vsCurrency?: string): number | undefined {
    if (!vsCurrency) {
      vsCurrency = this.defaultVsCurrency;
    }

    if (!this.supportedVsCurrencies[vsCurrency]) {
      return undefined;
    }

    this.updateURL([coinId], [vsCurrency]);

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
    coin: CoinPretty,
    vsCurrrency?: string
  ): PricePretty | undefined {
    if (!coin.currency.coinGeckoId) {
      return undefined;
    }

    if (!vsCurrrency) {
      vsCurrrency = this.defaultVsCurrency;
    }

    const fiatCurrency = this.supportedVsCurrencies[vsCurrrency];
    if (!fiatCurrency) {
      return undefined;
    }

    if (coin.toDec().isZero()) {
      return new PricePretty(fiatCurrency, 0);
    }

    const price = this.getPrice(coin.currency.coinGeckoId, vsCurrrency);
    if (price === undefined) {
      return new PricePretty(fiatCurrency, new Int(0)).ready(false);
    }

    const dec = coin.toDec();
    const priceDec = new Dec(price.toString());

    return new PricePretty(fiatCurrency, dec.mul(priceDec));
  }

  async waitPrice(
    coinId: string,
    vsCurrency?: string
  ): Promise<number | undefined> {
    if (!vsCurrency) {
      vsCurrency = this.defaultVsCurrency;
    }

    if (!this.supportedVsCurrencies[vsCurrency]) {
      return Promise.resolve(undefined);
    }

    if (this.response?.data[coinId] && this.response.data[coinId][vsCurrency]) {
      return Promise.resolve(this.response.data[coinId][vsCurrency]);
    }

    this.updateURL([coinId], [vsCurrency]);

    await this.waitResponse();

    const coinPrices = this.response?.data[coinId];
    if (!coinPrices) {
      return undefined;
    }
    return coinPrices[vsCurrency];
  }

  async waitFreshPrice(
    coinId: string,
    vsCurrency?: string
  ): Promise<number | undefined> {
    if (!vsCurrency) {
      vsCurrency = this.defaultVsCurrency;
    }

    if (!this.supportedVsCurrencies[vsCurrency]) {
      return Promise.resolve(undefined);
    }

    this.updateURL([coinId], [vsCurrency]);

    await this.waitFreshResponse();

    const coinPrices = this.response?.data[coinId];
    if (!coinPrices) {
      return undefined;
    }
    return coinPrices[vsCurrency];
  }

  async waitCalculatePrice(
    coin: CoinPretty,
    vsCurrrency?: string
  ): Promise<PricePretty | undefined> {
    if (!coin.currency.coinGeckoId) {
      return undefined;
    }

    if (!vsCurrrency) {
      vsCurrrency = this.defaultVsCurrency;
    }

    const fiatCurrency = this.supportedVsCurrencies[vsCurrrency];
    if (!fiatCurrency) {
      return undefined;
    }

    if (coin.toDec().isZero()) {
      return new PricePretty(fiatCurrency, 0);
    }

    const price = await this.waitPrice(coin.currency.coinGeckoId, vsCurrrency);
    if (price === undefined) {
      return new PricePretty(fiatCurrency, new Int(0)).ready(false);
    }

    const dec = coin.toDec();
    const priceDec = new Dec(price.toString());

    return new PricePretty(fiatCurrency, dec.mul(priceDec));
  }

  async waitFreshCalculatePrice(
    coin: CoinPretty,
    vsCurrrency?: string
  ): Promise<PricePretty | undefined> {
    if (!coin.currency.coinGeckoId) {
      return undefined;
    }

    if (!vsCurrrency) {
      vsCurrrency = this.defaultVsCurrency;
    }

    const fiatCurrency = this.supportedVsCurrencies[vsCurrrency];
    if (!fiatCurrency) {
      return undefined;
    }

    if (coin.toDec().isZero()) {
      return new PricePretty(fiatCurrency, 0);
    }

    const price = await this.waitFreshPrice(
      coin.currency.coinGeckoId,
      vsCurrrency
    );
    if (price === undefined) {
      return new PricePretty(fiatCurrency, new Int(0)).ready(false);
    }

    const dec = coin.toDec();
    const priceDec = new Dec(price.toString());

    return new PricePretty(fiatCurrency, dec.mul(priceDec));
  }
}
