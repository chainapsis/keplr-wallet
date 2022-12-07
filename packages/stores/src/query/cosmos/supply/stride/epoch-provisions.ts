import { ChainGetter, ObservableQuery } from "../../../../common";
import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { EpochProvisions } from "../types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { ObservableQueryStrideMintParams } from "./params";

export class ObservableQueryStrideEpochProvisions extends ObservableQuery<EpochProvisions> {
  protected readonly chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryStrideMintParams: ObservableQueryStrideMintParams
  ) {
    const instance = Axios.create({
      baseURL: "https://stride-fleet.main.stridenet.co/api",
    });

    super(kvStore, instance, `/mint/v1beta/epoch_provisions`);

    this.chainId = chainId;
    this.chainGetter = chainGetter;
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.chainId.startsWith("stride");
  }

  @computed
  get epochProvisions(): CoinPretty | undefined {
    if (!this.response || !this.queryStrideMintParams.mintDenom) {
      return;
    }

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(
      (cur) => cur.coinMinimalDenom === this.queryStrideMintParams.mintDenom
    );
    if (!currency) {
      throw new Error("Unknown currency");
    }

    let provision = this.response.data.epoch_provisions;
    if (provision.includes(".")) {
      provision = provision.slice(0, provision.indexOf("."));
    }
    return new CoinPretty(currency, new Int(provision));
  }
}
