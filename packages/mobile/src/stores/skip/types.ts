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
          }[];
        }
      | undefined;
  };
}

export interface MsgsDirectResponse {
  msgs: {
    chain_id: string;
    path: string[];
    msg: string;
    msg_type_url: string;
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
          swap_in: {
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
          estimated_affiliate_fee: string;
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
  txs_required: number;
}

export interface ChainsResponse {
  chains: {
    chain_id: string;
    pfm_enabled: boolean;
    supports_memo?: boolean;
  }[];
}
