import { KVStore } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { ObservableQuery } from "../../../../common";
import { StrideMintParams } from "./types";

export class ObservableQueryStrideMintParams extends ObservableQuery<StrideMintParams> {
  protected readonly chainId: string;

  constructor(kvStore: KVStore, chainId: string) {
    const instance = Axios.create({
      baseURL: "https://stride-fleet.main.stridenet.co/api",
    });

    super(kvStore, instance, `/mint/v1beta/params`);

    this.chainId = chainId;
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.chainId.startsWith("stride");
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
