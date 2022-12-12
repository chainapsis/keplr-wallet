import { KVStore } from "@keplr-wallet/common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../../common";
import { ObservableChainQuery } from "../../../chain-query";
import { EpochProvisions } from "../types";

export class ObservableQueryStrideEpochProvisions extends ObservableChainQuery<EpochProvisions> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/mint/v1beta1/epoch_provisions`);

    makeObservable(this);
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
