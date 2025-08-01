import { CoinPretty } from "@keplr-wallet/unit";

export type StarknetValidator = {
  id: string;
  address: string;
  operational_address: string;
  reward_address: string;
  total_stake: string;
  self_stake: string;
  delegators_count: number;
  delegators_count_change_24h?: string;
  total_stake_change_24h?: string;
  commission?: number;
  pool_address?: string;
  is_active: boolean;
};

export type StarknetValidators = StarknetValidator[];

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
