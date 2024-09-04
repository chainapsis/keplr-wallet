export interface ICSProviderParams {
  params: {
    template_client: {
      chain_id: string;
      trust_level: { numerator: string; denominator: string };
      trusting_period: string;
      unbonding_period: string;
      max_clock_drift: string;
      frozen_height: { revision_number: string; revision_height: string };
      latest_height: { revision_number: string; revision_height: string };
      proof_specs: {
        leaf_spec: {
          hash: string;
          prehash_key: string;
          prehash_value: string;
          length: string;
          prefix: string;
        };
        inner_spec: {
          child_order: number[];
          child_size: number;
          min_prefix_length: number;
          max_prefix_length: number;
          empty_child: null;
          hash: string;
        };
        max_depth: number;
        min_depth: number;
        prehash_key_before_comparison: boolean;
      }[];
      upgrade_path: string[];
      allow_update_after_expiry: boolean;
      allow_update_after_misbehaviour: boolean;
    };
    trusting_period_fraction: string;
    ccv_timeout_period: string;
    init_timeout_period: string;
    vsc_timeout_period: string;
    slash_meter_replenish_period: string;
    slash_meter_replenish_fraction: string;
    consumer_reward_denom_registration_fee: {
      denom: string;
      amount: string;
    };
    blocks_per_epoch: string;
    number_of_epochs_to_start_receiving_rewards: string;
    max_provider_consensus_validators?: string;
  };
}
