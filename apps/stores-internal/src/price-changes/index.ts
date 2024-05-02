import { ObservableQuery, QuerySharedContext } from "@keplr-wallet/stores";
import { ResPrice24hChanges } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { autorun, makeObservable } from "mobx";
import { makeURL } from "@keplr-wallet/simple-fetch";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { computedFn } from "mobx-utils";

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

export class Price24HChangesStore extends ObservableQuery<ResPrice24hChanges> {
  protected _isInitialized: boolean;

  private _coinIds: SortedSetStorage;

  protected _throttler: Throttler;

  protected _optionUri: string;

  constructor(
    protected readonly kvStore: KVStore,
    options: {
      readonly baseURL: string;
      readonly uri: string;

      // Default is 250ms
      readonly throttleDuration?: number;
    }
  ) {
    super(
      new QuerySharedContext(kvStore, {
        responseDebounceMs: 0,
      }),
      options.baseURL,
      options.uri
    );
    this._optionUri = options.uri;

    this._isInitialized = false;

    const throttleDuration = options.throttleDuration ?? 250;

    this._coinIds = new SortedSetStorage(
      kvStore,
      "__coin_ids",
      throttleDuration
    );

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

    await this._coinIds.restore();

    // No need to wait
    this._coinIds.save();

    this.updateURL([], true);

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

  protected override canFetch(): boolean {
    return this._coinIds.values.length > 0;
  }

  protected updateURL(coinIds: string[], forceSetUrl: boolean = false) {
    const coinIdsUpdated = this._coinIds.add(...coinIds);

    if (coinIdsUpdated || forceSetUrl) {
      const url = `${this._optionUri}?ids=${this._coinIds.values.join(",")}`;

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

  get24HChange = computedFn((coinId: string): RatePretty | undefined => {
    this.updateURL([coinId]);

    if (!this.response) {
      return undefined;
    }

    const coinChanges = this.response?.data;
    if (!coinChanges) {
      return undefined;
    }
    const res = coinChanges[coinId];
    if (res == null) {
      return undefined;
    }
    return new RatePretty(new Dec(res).quo(new Dec(100)));
  });

  async wait24HChange(coinId: string): Promise<RatePretty | undefined> {
    {
      const res = this.response?.data[coinId];
      if (res != null) {
        return new RatePretty(new Dec(res).quo(new Dec(100)));
      }
    }

    this.updateURL([coinId]);

    await this.waitResponse();

    const coinChanges = this.response?.data;
    if (!coinChanges) {
      return undefined;
    }
    const res = coinChanges[coinId];
    if (res == null) {
      return undefined;
    }
    return new RatePretty(new Dec(res).quo(new Dec(100)));
  }

  async waitFresh24HChange(coinId: string): Promise<RatePretty | undefined> {
    this.updateURL([coinId]);

    await this.waitFreshResponse();

    const coinChanges = this.response?.data;
    if (!coinChanges) {
      return undefined;
    }
    const res = coinChanges[coinId];
    if (res == null) {
      return undefined;
    }
    return new RatePretty(new Dec(res).quo(new Dec(100)));
  }
}
