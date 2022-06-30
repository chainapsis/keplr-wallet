import { ObservableChainQuery } from "../../chain-query";
import { DistributionParams } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
import { RatePretty } from "@keplr-wallet/unit";

export class ObservableQueryDistributionParams extends ObservableChainQuery<DistributionParams> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/cosmos/distribution/v1beta1/params");

    makeObservable(this);
  }

  @computed
  get communityTax(): RatePretty {
    if (!this.response) {
      return new RatePretty(0);
    }

    return new RatePretty(this.response.data.params.community_tax);
  }
}
