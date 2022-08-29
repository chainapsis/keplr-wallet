export type TokenInfo = {
  asset: string;
  details: {
    token_name: string;
    symbol: string;
    decimals: number;
    capacity: string;
  };
  address: string;
  confirmed: boolean;
  is_external: boolean;
  burner_code_hash: string;
};
