export type Cw20ContractBalance = {
  balance: string;
};

export type Cw20ContractTokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: string;
};

export interface NativeBridgeStatus {
  paused: boolean;
  swapMin: string;
  swapMax: string;
  supply: string;
  cap: string;
  fee: string;
  reverseAggLimit: string;
  reverseAggLimitCap: string;
}

export interface FullStateData {
  cap: string;
  contract_addr_human: string;
  denom: string;
  fees_accrued: string;
  lower_swap_limit: string;
  next_swap_id: number;
  paused_since_block_public_api: number;
  paused_since_block_relayer_api: number;
  relay_eon: number;
  reverse_aggregated_allowance: string;
  reverse_aggregated_allowance_approver_cap: string;
  sealed_reverse_swap_id: number;
  supply: string;
  swap_fee: string;
  upper_swap_limit: string;
}
