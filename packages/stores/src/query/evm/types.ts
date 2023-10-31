export type Erc20ContractTokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
  // TODO: Add the `total_supply`
};

export interface EthBridgeStatus {
  paused: boolean;
  swapMin: string;
  swapMax: string;
  supply: string;
  cap: string;
  fee: string;
  reverseAggLimit: string;
  reverseAggLimitCap: string;
}

export interface EtherscanGasFeeResponse {
  status: string;
  result: {
    suggestBaseFee: string | undefined;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
  };
}

export interface EthGasFeeInfo {
  base: string | undefined;
  low: string;
  average: string;
  high: string;
}

export interface NativeBridgeLogResponse {
  address: string;
  data: string;
  removed: boolean;
  topics: string[];
  transactionHash: string | null;
}
