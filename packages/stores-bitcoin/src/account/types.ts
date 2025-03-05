import { CoinPretty } from "@keplr-wallet/unit";

export interface SelectUTXOsParams {
  utxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  feeRate: number;
  inscriptionUtxos?: Pick<UTXO, "txid" | "vout">[];
  runesUtxos?: Pick<UTXO, "txid" | "vout">[];
  dustRelayFeeRate?: number;
  changeAddress?: string;
}

export interface BuildPsbtParams {
  utxos: UTXO[];
  senderAddress: string;
  recipients: UTXOSelectionRecipient[];
  estimatedFee: CoinPretty;
  xonlyPubKey?: Uint8Array;
}

export interface UTXOSelection {
  selectedUtxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  estimatedFee: CoinPretty;
  vsize: number;
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
