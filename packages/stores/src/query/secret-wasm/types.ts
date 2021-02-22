export type SecretContractCodeHash = {
  height: string;
  result: string;
};

export type Secret20ContractTokenInfo = {
  token_info: {
    decimals: number;
    name: string;
    symbol: string;
    // TODO: Add the `total_supply`
  };
};
