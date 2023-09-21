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

export interface RouteResponse {
  amount_in: string;
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  operations: (
    | {
        transfer: {
          port: string;
          channel: string;
          chain_id: string;
          pfm_enabled?: boolean;
          dest_denom: string;
        };
      }
    | {
        // TODO
        swap: unknown;
      }
  )[];
  chain_ids: string[];
  does_swap?: boolean;
  estimated_amount_out?: string;
  swap_venue?: {
    name: string;
    chain_id: string;
  };
}

export interface ChainsResponse {
  chains: {
    chain_id: string;
    pfm_enabled: boolean;
  }[];
}
