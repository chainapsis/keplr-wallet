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

export interface RouteRequestV2 {
  from_chain: string; // source chain id
  from_token: string; // source token denom
  to_chain: string; // destination chain id
  to_token: string; // destination token denom
  from_address: string; // from chain user address
  to_address: string; // to chain user address
  amount: string; // amount to swap
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

export enum RouteStepType {
  SWAP = "swap",
  BRIDGE = "bridge",
  IBC_TRANSFER = "ibc-transfer",
}

export interface RouteStep {
  type: RouteStepType;
  from_chain: string;
  to_chain: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

export type SkipOperation =
  | {
      transfer: {
        port: string;
        channel: string;
        chain_id: string;
        pfm_enabled?: boolean;
        dest_denom: string;
        supports_memo?: boolean;
      };
    }
  | {
      swap: {
        swap_in?: {
          swap_venue: {
            name: string;
            chain_id: string;
          };
          swap_operations: {
            pool: string;
            denom_in: string;
            denom_out: string;
          }[];
          swap_amount_in: string;
          price_impact_percent?: string;
        };
        smart_swap_in?: {
          swap_venue: {
            name: string;
            chain_id: string;
          };
          swap_routes: {
            swap_amount_in: string;
            denom_in: string;
            swap_operations: {
              pool: string;
              denom_in: string;
              denom_out: string;
            }[];
          }[];
          estimated_amount_out: string;
        };
        estimated_affiliate_fee: string;
      };
    }
  | {
      evm_swap: {
        amount_in: string;
        amount_out: string;
        denom_in: string;
        denom_out: string;
        from_chain_id: string;
        input_token: string;
        swap_calldata: string;
      };
    }
  | {
      cctp_transfer: {
        bridge_id: string;
        burn_token: string;
        denom_in: string;
        denom_out: string;
        from_chain_id: string;
        to_chain_id: string;
        smart_relay: boolean;
        smart_relay_fee_quote: {
          fee_amount: string;
          fee_denom: string;
          relayer_address: string;
          expiration: string;
        };
      };
    }
  | {
      go_fast_transfer: {
        from_chain_id: string;
        to_chain_id: string;
        fee: {
          fee_asset: {
            denom: string;
            chain_id: string;
            is_cw20: boolean;
            is_evm: boolean;
            is_svm: boolean;
            symbol: string;
            decimals: number;
          };
          bps_fee: string;
          bps_fee_amount: string;
          bps_fee_usd: string;
          source_chain_fee_amount: string;
          source_chain_fee_usd: string;
          destination_chain_fee_amount: string;
          destination_chain_fee_usd: string;
        };
        denom_in: string;
        denom_out: string;
        source_domain: string;
        destination_domain: string;
      };
    }
  | {
      axelar_transfer: {
        from_chain: string;
        from_chain_id: string;
        to_chain: string;
        to_chain_id: string;
        asset: string;
        should_unwrap: boolean;
        denom_in: string;
        denom_out: string;
        fee_amount: string;
        usd_fee_amount: string;
        fee_asset: {
          denom: string;
          chain_id: string;
          is_cw20: boolean;
          is_evm: boolean;
          is_svm: boolean;
          symbol: string;
          name: string;
          decimals: number;
        };
        bridge_id: string;
        smart_relay: boolean;
      };
    }
  | {
      hyperlane_transfer: {
        from_chain_id: string;
        to_chain_id: string;
        denom_in: string;
        denom_out: string;
        hyperlane_contract_address: string;
        fee_amount: string;
        usd_fee_amount: string;
        fee_asset: {
          denom: string;
          chain_id: string;
          is_cw20: boolean;
          is_evm: boolean;
          is_svm: boolean;
          symbol: string;
          decimals: number;
        };
        bridge_id: string;
        smart_relay: boolean;
      };
    }
  | {
      eureka_transfer: {
        bridge_id: string;
        callback_adapter_contract_address: string;
        destination_port: string;
        entry_contract_address: string;
        denom_in: string;
        denom_out: string;
        source_client: string;
        from_chain_id: string;
        to_chain_id: string;
        to_chain_callback_contract_address: string;
        to_chain_entry_contract_address: string;
        pfm_enabled: boolean;
        smart_relay: boolean;
        smart_relay_fee_quote: {
          fee_amount: string;
          fee_denom: string;
          relayer_address: string;
          expiration: string;
        };
        supports_memo: boolean;
      };
    };

interface RouteResponseV2Base {
  amount_out: string;
  price_impact_percent: number;
  estimated_time: number;
  fees: {
    usd_amount: string;
    amount: string;
    fee_token: FeeToken;
  }[];
  steps: RouteStep[];
  required_chain_ids: string[];
}

export type RouteResponseV2 =
  | (RouteResponseV2Base & {
      provider: Provider.SKIP;
      skip_operations: SkipOperation[];
    })
  | (RouteResponseV2Base & {
      provider: Provider.SQUID;
    });

export interface TxRequestBase {
  from_chain: string;
  from_token: string;
  to_chain: string;
  to_token: string;
  amount: string;
  chain_ids_to_addresses: Record<string, string>;
  slippage: number;
}

export type TxRequest =
  | (TxRequestBase & {
      provider: Provider.SKIP;
      amount_out: string;
      required_chain_ids: string[];
      skip_operations: SkipOperation[];
    })
  | (TxRequestBase & {
      provider: Provider.SQUID;
    });

export interface CosmosTxData {
  chain_id: string;
  signer_address: string;
  msgs: (
    | {
        type: "cosmos-sdk/MsgTransfer";
        source_port: string;
        source_channel: string;
        token: {
          denom: string;
          amount: string;
        }[];
        sender: string;
        receiver: string;
        timeout_timestamp: string;
        memo?: string;
      }
    | {
        type: "wasm/MsgExecuteContract";
        sender: string;
        contract: string;
        msg: object;
        funds: {
          denom: string;
          amount: string;
        }[];
      }
    | {
        type: "cctp/DepositForBurn";
        from: string;
        amount: string;
        destination_domain: number;
        mint_recipient: string;
        burn_token: string;
      }
  )[];
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

export type SwapTransaction =
  | {
      chain_type: ChainType.COSMOS;
      tx_data: CosmosTxData;
    }
  | {
      chain_type: ChainType.EVM;
      tx_data: EVMTxData;
    };

export interface TxResponse {
  provider: Provider;
  txs: SwapTransaction[];
}

// TODO: move status query types out of this file
export interface TxStatusRequest {
  provider: Provider;
  from_chain: string;
  to_chain: string;
  tx_hash: string;
}

export enum TxStatus {
  IN_PROGRESS = "in_progress",
  SUCCESS = "success",
  PARTIAL_SUCCESS = "partial_success",
  FAILED = "failed",
}

export interface TxStatusStep {
  chain_id: string;
  status: Omit<TxStatus, TxStatus.PARTIAL_SUCCESS>;
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
  status: TxStatus;
  steps: TxStatusStep[];
  asset_location: AssetLocation[];
}

export interface ChainsResponseV2 {
  chains: {
    chain_id: string;
    pfm_enabled: boolean;
    supports_memo?: boolean;
    chain_type: string;
  }[];
}

export type NoneIBCBridgeInfoV2 = {
  destinationChainId: string;
  denom: string;
};

export type IBCChannelV2 = {
  destinationChainId: string;
  originDenom: string;
  originChainId: string;

  channels: {
    portId: string;
    channelId: string;
    counterpartyChainId: string;
  }[];

  denom: string;
};
