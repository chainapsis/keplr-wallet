export interface TxoStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

export interface AddressDetails {
  address: string;
  chain_stats: TxoStats;
  mempool_stats: TxoStats;
}

export interface FeeEstimates {
  [key: string]: number;
}

export interface Fees {
  fastestFee: number; // fee for inclusion in the next block
  halfHourFee: number; // fee for inclusion in a block in 30 mins
  hourFee: number; // fee for inclusion in a block in 1 hour
  economyFee: number; // inclusion not guaranteed
  minimumFee: number; // the minimum fee of the network
}

export interface UTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}
