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
  status: TxStatus;
  value: number;
}

interface TxVout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

interface TxVin {
  txid: string;
  vout: number;
  prevout: TxVout;
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: boolean;
  sequence: number;
  witness: string[];
  inner_redeemscript_asm: string;
  inner_witnessscript_asm: string;
}

interface TxStatus {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface BitcoinTx {
  txid: string;
  version: number;
  locktime: number;
  size: number;
  weight: number;
  fee: number;
  vin: TxVin[];
  vout: TxVout[];
  status: TxStatus;
}
