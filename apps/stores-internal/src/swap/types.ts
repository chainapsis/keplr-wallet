export interface SwappableResponse {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface TargetAssetsResponse {
  tokens: {
    token_id: string;
    type: string;
    chain_id: string;
    denom: string;
    symbol: string;
    name: string;
    decimals: 6;
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
