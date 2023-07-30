export interface TokenContract {
  contractAddress: string;
  imageUrl?: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
  };
  coinGeckoId?: string;
}
