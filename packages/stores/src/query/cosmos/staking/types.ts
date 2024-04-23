import { CoinPrimitive } from "../../../common";

export type Rewards = {
  rewards: DelegatorReward[] | null;
  total: CoinPrimitive[];
};

export type DelegatorReward = {
  validator_address: string;
  reward: CoinPrimitive[] | null;
};

export type Delegations = {
  delegation_responses: Delegation[];
  // pagination: {}
};

export type Delegation = {
  delegation: {
    delegator_address: string;
    validator_address: string;
    // Dec
    shares: string;
  };
  balance: {
    denom: string;
    amount: string;
  };
};

export type UnbondingDelegations = {
  unbonding_responses: UnbondingDelegation[];
  // pagination: {}
};

export type UnbondingDelegation = {
  delegator_address: string;
  validator_address: string;
  entries: {
    creation_height: string;
    completion_time: string;
    initial_balance: string;
    balance: string;
  }[];
};

export type Validator = {
  operator_address: string;
  consensus_pubkey: {
    "@type": string;
    // Base64
    key: string;
  };
  jailed: boolean;
  status:
    | "BOND_STATUS_UNSPECIFIED"
    | "BOND_STATUS_UNBONDED"
    | "BOND_STATUS_UNBONDING"
    | "BOND_STATUS_BONDED";
  // Int
  tokens: string;
  // Dec
  delegator_shares: string;
  description: {
    moniker?: string;
    identity?: string;
    website?: string;
    security_contact?: string;
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
  validators: Validator[];
  // pagination: {}
};

export enum BondStatus {
  Unbonded = "Unbonded",
  Unbonding = "Unbonding",
  Bonded = "Bonded",
  Unspecified = "Unspecified",
}

export type StakingParams = {
  params: {
    unbonding_time: string;
    max_validators: number;
    max_entries: number;
    historical_entries: number;
    bond_denom: string;
  };
};

export type StakingPool = {
  pool: {
    // Int
    not_bonded_tokens: string;
    // Int
    bonded_tokens: string;
  };
};
