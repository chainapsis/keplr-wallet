import { ObservableChainQuery } from "../../chain-query";
import { DistributionParams } from "./types";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { RatePretty } from "@keplr-wallet/unit";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryDistributionParams extends ObservableChainQuery<DistributionParams> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/cosmos/distribution/v1beta1/params"
    );

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
