import { Dec } from "@keplr-wallet/unit";

export interface SelectUTXOsParams {
  senderAddress: string;
  utxos: UTXO[];
  recipients: UTXOSelectionRecipient[];
  feeRate: number;
  isSendMax?: boolean;
  discardDustChange?: boolean;
}

export interface SelectionParams {
  utxos: UTXO[];
  targetAmount: Dec;
  calculateTxSize: (
    inputCount: number,
    outputParams: Record<string, number>,
    includeChange: boolean
  ) => {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
  };
  calculateFee: (size: number) => Dec;
  isDust: (amount: Dec) => boolean;
  outputParams: Record<string, number>;
  discardDustChange: boolean;
  timeoutMs?: number;
}

export interface BuildPsbtParams {
  utxos: UTXO[];
  senderAddress: string;
  recipients: UTXOSelectionRecipient[];
  feeRate: number;
  xonlyPubKey?: Uint8Array;
  isSendMax?: boolean;
  hasChange?: boolean;
}

export interface UTXOSelection {
  selectedUtxos: UTXO[];
  txSize: {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
  };
  hasChange: boolean;
}

export interface SelectionResult {
  utxoIds: Set<string>;
  totalValue: Dec;
  effectiveValue: Dec;
  wastage: Dec;
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
