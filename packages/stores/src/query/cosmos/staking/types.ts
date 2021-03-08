import { CoinPrimitive } from "../../../common";

export type Rewards = {
  height: string;
  result: {
    rewards: DelegatorReward[] | null;
    total: CoinPrimitive[];
  };
};

export type DelegatorReward = {
  validator_address: string;
  reward: CoinPrimitive[] | null;
};

export type Delegations = {
  height: string;
  result: Delegation[];
};

export type Delegation = {
  delegator_address: string;
  validator_address: string;
  // Dec
  shares: string;
  // Int
  balance:
    | string
    // There is difference according to the cosmos-sdk's version.
    // But, latter is the latest version.
    | {
        denom: string;
        amount: string;
      };
};

export type DelegationsStargate = {
  height: string;
  result: DelegationStargate[];
};

export type DelegationStargate = {
  delegation: {
    delegator_address: string;
    validator_address: string;
    // Dec
    shares: string;
  };
  balance:
    | string
    | {
        denom: string;
        amount: string;
      };
};

export type UnbondingDelegations = {
  height: string;
  result: UnbondingDelegation[];
};

export type UnbondingDelegation = {
  delegator_address: string;
  validator_address: string;
  entries: [
    {
      creation_height: string;
      completion_time: string;
      initial_balance: string;
      balance: string;
    }
  ];
};

export type Validator = {
  operator_address: string;
  consensus_pubkey: string;
  jailed: boolean;
  status: number;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker?: string;
    identity?: string;
    website?: string;
    details?: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    commission_rates: {
      // Dec
      rate: string;
      // Dec
      max_rate: string;
      // Dec
      max_change_rate: string;
    };
    update_time: string;
  };
  // Int
  min_self_delegation: string;
};

export type Validators = {
  height: string;
  result: Validator[];
};

export enum BondStatus {
  Unbonded = "Unbonded",
  Unbonding = "Unbonding",
  Bonded = "Bonded",
}

export type StakingParams = {
  height: string;
  result: {
    unbonding_time: string;
    max_validators: number;
    max_entries: number;
    bond_denom: string;
  };
};

export type StakingPool = {
  height: string;
  result: {
    // Int
    notBondedTokens: string;
    // Int
    bonded_tokens: string;
  };
};
