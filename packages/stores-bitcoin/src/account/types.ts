import { CoinPretty } from "@keplr-wallet/unit";

export interface SelectUTXOsParams {
  utxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  changeAddress: string;
  feeRate: number;
  inscriptionUtxos?: Pick<UTXO, "txid" | "vout">[];
  runesUtxos?: Pick<UTXO, "txid" | "vout">[];
  dustRelayFeeRate?: number;
  noChange?: boolean;
}

export interface UTXOSelection {
  selectedUtxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  fee: CoinPretty;
  txSize: number;
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

export interface UTXOSelectionRecipient {
  amount: number;
  address: string;
}
