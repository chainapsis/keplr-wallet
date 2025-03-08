import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

export interface SelectUTXOsParams {
  senderAddress: string;
  utxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  feeRate: number;
  feeCurrency?: AppCurrency;
  isSendMax?: boolean;
  discardDustChange?: boolean;
}

export interface BuildPsbtParams {
  utxos: UTXO[];
  senderAddress: string;
  recipients: UTXOSelectionRecipient[];
  estimatedFee: CoinPretty;
  xonlyPubKey?: Uint8Array;
  isSendMax?: boolean;
  hasChange?: boolean;
}

export interface UTXOSelection {
  selectedUtxos: UTXO[];
  spendableAmount: Dec;
  estimatedFee: CoinPretty;
  txSize: {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
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
