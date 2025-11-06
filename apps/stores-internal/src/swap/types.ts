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

export interface ValidateTargetAssetsResponse {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}
