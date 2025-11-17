export enum Provider {
  SKIP = "skip",
  SQUID = "squid",
}

export enum ChainType {
  COSMOS = "cosmos",
  EVM = "evm",
}

export interface SwappableRequest {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface SwappableResponse {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface TargetAssetsRequest {
  chain_id: string;
  denom: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TargetAssetsResponse {
  tokens: {
    token_id: string;
    type: string;
    chain_id: string;
    denom: string;
    symbol: string;
    name: string;
    decimals: number;
    image_url?: string | null;
    coingecko_id?: string | null;
    vendor: string[];
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface RelatedAssetsRequest {
  chain_id: string;
  denom: string;
}

export interface RelatedAssetsResponse {
  tokens: {
    token_id: string;
    type: string;
    chain_id: string;
    denom: string;
    symbol: string;
    name: string;
    decimals: number;
    image_url?: string | null;
    coingecko_id?: string | null;
    vendor: string[];
  }[];
}

export interface ValidateTargetAssetsRequest {
  chain_id: string;
  denom: string;
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface ValidateTargetAssetsResponse {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface RouteRequest {
  from_chain: string; // source chain id
  from_token: string; // source token denom
  to_chain: string; // destination chain id
  to_token: string; // destination token denom
  amount: string; // amount to swap
  chain_ids_to_addresses: Record<string, string>; // mapping of chain ids to user addresses
  slippage: number; // minimum 0, maximum 100
}

export interface FeeToken {
  type: ChainType;
  chain_id: string;
  denom: string;
  symbol: string;
  name: string;
  decimals: number;
  coingecko_id: string;
  image_url: string;
}

export interface RouteStep {
  type: "swap" | "bridge" | "ibc-transfer";
  from_chain: string;
  to_chain: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

export interface CosmosTxData {
  chain_id: string;
  signer_address: string;
  msgs: {
    type: string;
    value: any;
  }[];
}

export interface EVMTxData {
  chain_id: string;
  to: string;
  data: string;
  value: string;
  gas_limit?: string;
  gas_price?: string;
  max_fee_per_gas?: string;
  max_priority_fee_per_gas?: string;
  approvals: {
    token_contract: string;
    spender: string;
    amount: string;
  }[]; // required erc20 approvals
}

export interface RouteResponse {
  provider: Provider;
  amount_out: string; // expected amount out
  estimated_time: number; // estimated time in seconds
  fees: {
    usd_amount: string;
    amount: string;
    fee_token: FeeToken;
  }[];
  steps: RouteStep[];
  transactions:
    | {
        chain_type: ChainType.COSMOS;
        tx_data: CosmosTxData;
      }
    | {
        chain_type: ChainType.EVM;
        tx_data: EVMTxData;
      }[];
}

export interface TxStatusRequest {
  provider: Provider;
  from_chain: string;
  to_chain: string;
  tx_hash: string;
}

export interface TxStatusStep {
  chain_id: string;
  status: "success" | "failed" | "in_progress";
  tx_hash?: string;
  explorer_url?: string;
}

export interface AssetLocation {
  chain_id: string;
  denom: string;
  amount: string;
}

export interface TxStatusResponse {
  provider: Provider;
  status: "in_progress" | "success" | "partial_success" | "failed";
  steps: TxStatusStep[];
  asset_location: AssetLocation[];
}
