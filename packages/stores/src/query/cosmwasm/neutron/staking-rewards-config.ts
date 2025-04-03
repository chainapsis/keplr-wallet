import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../chain";
import { ObservableCosmwasmContractChainQuery } from "../contract-query";
import { QuerySharedContext } from "../../../common";

interface NeutronStakingRewardsConfigResponse {
  owner: string;
  dao_address: string;
  staking_info_proxy: string;
  annual_reward_rate_bps: number; // APR in basis points (e.g., 500 = 5%)
  blocks_per_year: number;
  staking_denom: string;
}

export class ObservableQueryNeutronStakingRewardsConfig extends ObservableCosmwasmContractChainQuery<NeutronStakingRewardsConfigResponse> {
  //FIXME- mainnet 런칭시 해당 주소를 mainnet 주소로 변경
  public static readonly NEUTRON_REWARDS_CONTRACT_ADDRESS =
    "neutron1h62p45vv3fg2q6sm00r93gqgmhqt9tfgq5hz33qyrhq8f0pqqj0s36wgc3";

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
