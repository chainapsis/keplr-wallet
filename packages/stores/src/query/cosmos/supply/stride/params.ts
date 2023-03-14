import { Dec } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../../chain";
import { ObservableChainQuery } from "../../../chain-query";
import { StrideMintParams } from "./types";
import { QuerySharedContext } from "../../../../common";

export class ObservableQueryStrideMintParams extends ObservableChainQuery<StrideMintParams> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, `/mint/v1beta1/params`);

    makeObservable(this);
  }

  get mintDenom(): string | undefined {
    return this.response?.data.params.mint_denom;
  }

  @computed
  get distributionProportions(): {
    staking: Dec;
    communityPoolGrowth: Dec;
    communityPoolSecurityBudget: Dec;
    strategicReserve: Dec;
  } {
    if (!this.response) {
      return {
        staking: new Dec(0),
        communityPoolGrowth: new Dec(0),
        communityPoolSecurityBudget: new Dec(0),
        strategicReserve: new Dec(0),
      };
    }

    return {
      staking: new Dec(
        this.response.data.params.distribution_proportions.staking
      ),
      communityPoolGrowth: new Dec(
        this.response.data.params.distribution_proportions.community_pool_growth
      ),
      communityPoolSecurityBudget: new Dec(
        this.response.data.params.distribution_proportions.community_pool_security_budget
      ),
      strategicReserve: new Dec(
        this.response.data.params.distribution_proportions.strategic_reserve
      ),
    };
  }
}
