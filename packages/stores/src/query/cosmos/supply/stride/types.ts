export type StrideMintParams = {
  params: {
    distribution_proportions: {
      staking: string;
      community_pool_growth: string;
      community_pool_security_budget: string;
      strategic_reserve: string;
    };
    epoch_identifier: string;
    genesis_epoch_provisions: string;
    mint_denom: string;
    minting_rewards_distribution_start_epoch: string;
    reduction_factor: string;
    reduction_period_in_epochs: string;
  };
};
