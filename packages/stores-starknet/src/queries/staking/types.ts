import { CoinPretty } from "@keplr-wallet/unit";

export type StarknetValidator = {
  address: string;
  operational_address: string;
  reward_address: string;
  total_stake: string;
  self_stake: string;
  delegated_stake: string;
  delegators_count: number;
  delegators_count_change_24h: string;
  total_stake_change_24h: string;
  commission: number;
  pool_contract_address: string;
  is_active: boolean;
};

export type StarknetValidators = {
  validators: StarknetValidator[];
  total_count: number;
};

export type ClaimableReward = {
  validatorAddress: string;
  poolAddress: string; // pool address binding to the validator
  rewardAddress: string; // where to send the reward
  amount: CoinPretty;
};

export type UnpoolDelegation = {
  validatorAddress: string;
  poolAddress: string;
  rewardAddress: string;
  amount: CoinPretty;
  completeTime: number;
};
