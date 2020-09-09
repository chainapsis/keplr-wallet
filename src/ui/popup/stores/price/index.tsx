import { action, observable } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { Dec } from "@chainapsis/cosmosjs/common/decimal";

import Axios, { CancelTokenSource } from "axios";
import {
  CoinGeckoAPIEndPoint,
  CoinGeckoGetPrice,
  AutoFetchingFiatValueInterval
} from "../../../../config";
import { ChainInfo } from "../../../../background/chains";
import {
  getCurrencies,
  getFiatCurrencyFromLanguage
} from "../../../../common/currency";

interface CoinGeckoPriceResult {
  [id: string]: {
    [curreny: string]: number;
  };
}

interface Price {
  value: Dec;
  isFetching: boolean;
}

interface Prices {
  /**
   * Fiat currency. ex) usd, krw
   */
  [currency: string]: {
    /**
     * Coingecko id for pair.
     */
    [id: string]: Price;
  };
}

export class PriceStore {
  @observable
  private chainInfo!: ChainInfo;

  @observable
  private prices!: Prices;

  // Not need to be observable
  private lastFetchingCancleToken!: CancelTokenSource | undefined;
  // Price store fetchs price for chain by interval.
  // If chain is changed, abort last interval and restart fetching by interval.
  private lastFetchingIntervalId!: NodeJS.Timeout | undefined;

  // Not need to be observable
  private needFetchingCurrencies: { fiats: string[]; ids: string[] } = {
    fiats: [],
    ids: []
  };

  constructor() {
    this.init();
  }

  @action
  private init() {
    this.prices = {};
  }

  // This will be called by chain store.
  @actionAsync
  public async setChainInfo(info: ChainInfo) {
    const lastChainInfo = this.chainInfo;
    this.chainInfo = info;

    if (!lastChainInfo || lastChainInfo.chainId !== this.chainInfo.chainId) {
      if (this.lastFetchingIntervalId) {
        clearInterval(this.lastFetchingIntervalId);
        this.lastFetchingIntervalId = undefined;
      }

      const currencies = getCurrencies(this.chainInfo.currencies);
      if (currencies.length > 0) {
        const coinGeckoIds = currencies
          .map(currency => {
            return currency.coinGeckoId;
          })
          .filter(id => {
            return typeof id === "string" && id.length > 0;
          }) as string[];

        this.lastFetchingIntervalId = setInterval(() => {
          this.fetchValue(
            [getFiatCurrencyFromLanguage("default").currency],
            coinGeckoIds
          );
        }, AutoFetchingFiatValueInterval);
        await task(
          this.fetchValue(
            [getFiatCurrencyFromLanguage("default").currency],
            coinGeckoIds
          )
        );
      }
    }
  }

  /**
   * Fetch value from coingecko.
   * @param fiats Fiat currency. ex) usd, krw
   * @param ids Coingecko id for pair.
   */
  @actionAsync
  public async fetchValue(fiats: string[], ids: string[]) {
    // If fetching is in progess, abort it.
    if (this.lastFetchingCancleToken) {
      this.lastFetchingCancleToken.cancel();
      this.lastFetchingCancleToken = undefined;
    }

    for (const fiat of fiats) {
      const isNewFiat =
        fiat && this.needFetchingCurrencies.fiats.indexOf(fiat) < 0;
      if (isNewFiat) {
        this.needFetchingCurrencies.fiats.push(fiat);
      }
      for (const id of ids) {
        const isNewId = id && this.needFetchingCurrencies.ids.indexOf(id) < 0;
        if (isNewId) {
          this.needFetchingCurrencies.ids.push(id);
        }

        if (isNewFiat || isNewId) {
          // If this requested is new, try loading the cached value from storage.
          const cached = await task(this.loadValueFromStorage(fiat, id));
          if (cached) {
            this.setValue(fiat, id, {
              value: cached
            });
          }
        }
      }
    }

    fiats = this.needFetchingCurrencies.fiats;
    ids = this.needFetchingCurrencies.ids;

    for (const fiat of fiats) {
      for (const id of ids) {
        this.setValue(fiat, id, {
          isFetching: true
        });
      }
    }

    this.lastFetchingCancleToken = Axios.CancelToken.source();
    const result = await task(
      // Task should not throw an error.
      (async () => {
        try {
          const result = await Axios.get<CoinGeckoPriceResult>(
            CoinGeckoAPIEndPoint + CoinGeckoGetPrice,
            {
              method: "GET",
              params: {
                ids: ids.join(","),
                // eslint-disable-next-line @typescript-eslint/camelcase
                vs_currencies: fiats.join(",")
              },
              cancelToken: this.lastFetchingCancleToken?.token
            }
          );

          if (result.status === 200) {
            return {
              data: result.data
            };
          } else {
            return { data: {} };
          }
        } catch (e) {
          if (!Axios.isCancel(e)) {
            console.log(`Error occurs during fetching price: ${e.toString()}`);
          }
          return { data: {} };
        }
      })()
    );

    const data = result.data;

    for (const id in data) {
      if (!data.hasOwnProperty(id)) {
        continue;
      }
      const prices = data[id];
      if (prices) {
        for (const currency in prices) {
          if (!prices.hasOwnProperty(currency)) {
            continue;
          }
          const price = prices[currency];
          if (price) {
            this.setValue(currency, id, {
              value: new Dec(price.toString())
            });
          }
        }
      }
    }

    await task(
      this.saveResultDataToStorage({
        ...(await task(this.loadResultDataFromStorage()))?.priceData,
        ...data
      })
    );
    this.lastFetchingCancleToken = undefined;
    for (const fiat of fiats) {
      for (const id of ids) {
        this.setValue(fiat, id, {
          isFetching: false
        });
      }
    }
  }

  @action
  private setValue(fiat: string, id: string, price: Partial<Price>) {
    if (!this.prices[fiat]) {
      this.prices[fiat] = {};
    }

    const obj = this.prices[fiat][id];
    this.prices[fiat][id] = Object.assign(
      obj
        ? obj
        : {
            value: new Dec(0),
            isFetching: false
          },
      price
    );
  }

  public getValue(fiat: string, id: string | undefined): Price | undefined {
    if (!id) {
      return undefined;
    }

    if (this.prices[fiat]) {
      return this.prices[fiat][id];
    }
  }

  public hasFiat(fiat: string): boolean {
    return this.needFetchingCurrencies.fiats.indexOf(fiat) >= 0;
  }

  private async saveResultDataToStorage(
    data: CoinGeckoPriceResult
  ): Promise<void> {
    await browser.storage.local.set({ priceData: data });
  }

  private async loadResultDataFromStorage(): Promise<
    { priceData?: CoinGeckoPriceResult } | undefined
  > {
    return await browser.storage.local.get();
  }

  private async loadValueFromStorage(
    fiat: string,
    id: string
  ): Promise<Dec | undefined> {
    const items = await this.loadResultDataFromStorage();

    let result: Dec | undefined;

    if (items && items.priceData) {
      const data = items.priceData;

      if (data.hasOwnProperty(id)) {
        const prices = data[id];
        if (prices.hasOwnProperty(fiat)) {
          result = new Dec(prices[fiat].toString());
        }
      }
    }
    return result;
  }
}
