import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../chain";
import { ObservableCosmwasmContractChainQuery } from "../contract-query";
import { QuerySharedContext } from "../../../common";

interface NeutronStakingRewardsConfigResponse {
  owner?: string;
  dao_address?: string;
  staking_info_proxy?: string;
  annual_reward_rate_bps?: number; // APR in basis points (e.g., 500 = 5%)
  blocks_per_year?: number;
  staking_denom?: string;
}

export class ObservableQueryNeutronStakingRewardsConfig extends ObservableCosmwasmContractChainQuery<NeutronStakingRewardsConfigResponse> {
  public static readonly NEUTRON_REWARDS_CONTRACT_ADDRESS =
    "neutron1gqq3c735pj6ese3yru5xr6ud0fvxgltxesygvyyzpsrt74v6yg4sgkrgwq";

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      ObservableQueryNeutronStakingRewardsConfig.NEUTRON_REWARDS_CONTRACT_ADDRESS,
      {
        config: {},
      }
    );
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return super.canFetch();
  }

  @computed
  get config(): NeutronStakingRewardsConfigResponse {
    if (!this.response?.data) {
      return {
        owner: "",
        dao_address: "",
        staking_info_proxy: "",
        annual_reward_rate_bps: 0,
        blocks_per_year: 0,
        staking_denom: "",
      };
    }
    return this.response?.data;
  }
}
