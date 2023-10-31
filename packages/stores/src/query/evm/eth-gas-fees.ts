import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { ObservableQuery, QueryError } from "../../common";
import { EthGasFeeInfo, EtherscanGasFeeResponse } from "./types";

export class ObservableQueryGasFees extends ObservableQuery<EtherscanGasFeeResponse> {
  constructor(kvStore: KVStore) {
    const instance = Axios.create({
      ...{
        baseURL: "https://api.etherscan.io",
      },
    });

    super(kvStore, instance, "/api?module=gastracker&action=gasoracle", {
      fetchingInterval: 30000, // 30 seconds
    });

    makeObservable(this);
  }

  @computed
  get fees(): EthGasFeeInfo | undefined {
    if (!this.low || !this.average || !this.high) {
      const error: QueryError<any> = {
        status: 0,
        statusText: "Failed to get fees",
        message: "Failed to get fees",
      };

      this.setError(error);
      return undefined;
    }

    return {
      low: this.low,
      average: this.average,
      high: this.high,
      base: this.base,
    };
  }

  @computed
  get low(): string | undefined {
    if (!this.response || !this.response.data || !this.response.data.result) {
      return undefined;
    }

    return this.response.data.result.SafeGasPrice;
  }

  @computed
  get average(): string | undefined {
    if (!this.response || !this.response.data || !this.response.data.result) {
      return undefined;
    }

    return this.response.data.result.ProposeGasPrice;
  }

  @computed
  get high(): string | undefined {
    if (!this.response || !this.response.data || !this.response.data.result) {
      return undefined;
    }

    return this.response.data.result.FastGasPrice;
  }

  @computed
  get base(): string | undefined {
    if (!this.response || !this.response.data || !this.response.data.result) {
      return undefined;
    }

    return this.response.data.result.suggestBaseFee;
  }
}
