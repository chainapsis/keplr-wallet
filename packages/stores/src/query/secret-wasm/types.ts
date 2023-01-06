export type SecretContractCodeHash = {
  code_hash: string;
};

export type Secret20ContractTokenInfo = {
  token_info: {
    decimals: number;
    name: string;
    symbol: string;
    // TODO: Add the `total_supply`
  };
};
