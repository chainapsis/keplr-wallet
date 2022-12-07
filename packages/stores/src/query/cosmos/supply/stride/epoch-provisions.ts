import { KVStore } from "@keplr-wallet/common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { ChainGetter, ObservableQuery } from "../../../../common";
import { EpochProvisions } from "../types";

export class ObservableQueryStrideEpochProvisions extends ObservableQuery<EpochProvisions> {
  protected readonly chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    const instance = Axios.create({
      baseURL: "https://stride-fleet.main.stridenet.co/api",
    });

    super(kvStore, instance, `/mint/v1beta1/epoch_provisions`);

    this.chainId = chainId;
    this.chainGetter = chainGetter;
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.chainId.startsWith("stride");
  }

  @computed
  get epochProvisions(): CoinPretty {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!this.response) {
      return new CoinPretty(chainInfo.stakeCurrency, new Int(0));
    }

    let provision = this.response.data.epoch_provisions;
    if (provision.includes(".")) {
      provision = provision.slice(0, provision.indexOf("."));
    }
    return new CoinPretty(chainInfo.stakeCurrency, new Int(provision));
  }
}
