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
