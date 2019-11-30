import { action, flow, observable } from "mobx";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

import Axios, { CancelTokenSource } from "axios";
import {
  CoinGeckoAPIEndPoint,
  CoinGeckoGetPrice,
  AutoFetchingFiatValueInterval
} from "../../../../options";
import { ChainInfo } from "../../../../chain-info";

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

  constructor() {
    this.init();
  }

  @action
  private init() {
    this.prices = {};
  }

  // This will be called by chain store.
  @action
  public setChainInfo = flow(function*(this: PriceStore, info: ChainInfo) {
    const lastChainInfo = this.chainInfo;
    this.chainInfo = info;

    if (!lastChainInfo || lastChainInfo.chainId !== this.chainInfo.chainId) {
      if (this.lastFetchingIntervalId) {
        clearInterval(this.lastFetchingIntervalId);
        this.lastFetchingIntervalId = undefined;
      }

      if (this.chainInfo.coinGeckoId) {
        this.lastFetchingIntervalId = setInterval(() => {
          if (this.chainInfo.coinGeckoId) {
            this.fetchValue("usd", this.chainInfo.coinGeckoId);
          }
        }, AutoFetchingFiatValueInterval);
        yield this.fetchValue("usd", this.chainInfo.coinGeckoId);
      }
    }
  });

  /**
   * Fetch value from coingecko.
   * @param currency Fiat currency. ex) usd, krw
   * @param id Coingecko id for pair.
   */
  @action
  public fetchValue = flow(function*(
    this: PriceStore,
    currency: string,
    id: string
  ) {
    // If fetching is in progess, abort it.
    if (this.lastFetchingCancleToken) {
      this.lastFetchingCancleToken.cancel();
      this.lastFetchingCancleToken = undefined;
    }

    this.setValue(currency, id, {
      isFetching: true
    });

    this.lastFetchingCancleToken = Axios.CancelToken.source();
    try {
      const result = yield Axios.get<CoinGeckoPriceResult>(
        CoinGeckoAPIEndPoint + CoinGeckoGetPrice,
        {
          method: "GET",
          params: {
            ids: id,
            // eslint-disable-next-line @typescript-eslint/camelcase
            vs_currencies: currency
          },
          cancelToken: this.lastFetchingCancleToken.token
        }
      );

      if (result.status === 200) {
        const data: CoinGeckoPriceResult = result.data;
        if (data[id]) {
          const prices = data[id];
          const price = prices[currency];
          if (price) {
            const dec = new Dec(price.toString());
            this.setValue(currency, id, {
              value: dec
            });
          }
        }
      }
    } catch (e) {
      if (!Axios.isCancel(e)) {
        console.log(`Error occurs during fetching price: ${e.toString()}`);
      }
    } finally {
      this.lastFetchingCancleToken = undefined;
      this.setValue(currency, id, {
        isFetching: false
      });
    }
  });

  @action
  private setValue(currency: string, id: string, price: Partial<Price>) {
    if (!this.prices[currency]) {
      this.prices[currency] = {};
    }

    const obj = this.prices[currency][id];
    this.prices[currency][id] = Object.assign(
      obj
        ? obj
        : {
            value: new Dec(0),
            isFetching: false
          },
      price
    );
  }

  public getValue(currency: string, id: string): Price | undefined {
    if (this.prices[currency]) {
      return this.prices[currency][id];
    }
  }
}
