export type Cw20ContractBalance = {
  data: {
    balance: string
  };
};
  
export type Cw20ContractTokenInfo = {
  data: {
    decimals: number;
    name: string;
    symbol: string;
    total_supply: string;
  };
};
  