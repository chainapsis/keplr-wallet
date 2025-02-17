export interface AssetsFromSourceResponse {
  dest_assets: {
    [chainId: string]:
      | {
          assets: {
            denom: string;
            chain_id: string;
            origin_denom: string;
            origin_chain_id: string;
          }[];
        }
      | undefined;
  };
}

export interface AssetsResponse {
  chain_to_assets_map: {
    [chainId: string]:
      | {
          assets: {
            denom: string;
            chain_id: string;
            origin_denom: string;
            origin_chain_id: string;
            is_evm: boolean;
            token_contract?: string;
            recommended_symbol?: string;
            decimals: number;
          }[];
        }
      | undefined;
  };
}

export interface MsgsDirectResponse {
  msgs: {
    multi_chain_msg?: {
      chain_id: string;
      path: string[];
      msg: string;
      msg_type_url: string;
    };
    evm_tx?: {
      chain_id: string;
      data: string;
      required_erc20_approvals: {
        amount: string;
        spender: string;
        token_contract: string;
      }[];
      signer_address: string;
      to: string;
      value: string;
    };
  }[];
  txs: {
    cosmos_tx?: {
      chain_id: string;
      path: string[];
      signer_address: string;
      msgs: {
        msg: string;
        msg_type_url: string;
      }[];
    };
    evm_tx?: {
      chain_id: string;
      data: string;
      required_erc20_approvals: {
        amount: string;
        spender: string;
        token_contract: string;
      }[];
      signer_address: string;
      to: string;
      value: string;
    };
  }[];
  route: RouteResponse;
}

export interface RouteResponse {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  amount_out: string;
  operations: (
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
  )[];
  chain_ids: string[];
  does_swap?: boolean;
  estimated_amount_out?: string;
  swap_price_impact_percent?: string;
  swap_venue?: {
    name: string;
    chain_id: string;
  };
  swap_venues?: {
    name: string;
    chain_id: string;
  }[];
  txs_required: number;
  estimated_fees?: {
    amount: string;
    origin_asset: {
      denom: string;
      chain_id: string;
    };
  }[];
  estimated_route_duration_seconds: number;
}

export interface ChainsResponse {
  chains: {
    chain_id: string;
    pfm_enabled: boolean;
    supports_memo?: boolean;
    chain_type: string;
  }[];
}

export type NoneIBCBridgeInfo = {
  destinationChainId: string;
  denom: string;
};

export type IBCChannel = {
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
