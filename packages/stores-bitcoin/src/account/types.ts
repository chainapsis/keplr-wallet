import { CoinPretty } from "@keplr-wallet/unit";

export interface SelectUTXOsParams {
  senderAddress: string;
  utxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  feeRate: number;
  inscriptionUtxos?: Pick<UTXO, "txid" | "vout">[];
  runesUtxos?: Pick<UTXO, "txid" | "vout">[];
  discardDust?: boolean;
  dustRelayFeeRate?: number;
}

export interface BuildPsbtParams {
  utxos: UTXO[];
  senderAddress: string;
  recipients: UTXOSelectionRecipient[];
  estimatedFee: CoinPretty;
  xonlyPubKey?: Uint8Array;
  hasChange?: boolean;
}

export interface UTXOSelection {
  selectedUtxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  estimatedFee: CoinPretty;
  txSize: {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
    dustVBytes?: number;
  };
  hasChange: boolean;
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
