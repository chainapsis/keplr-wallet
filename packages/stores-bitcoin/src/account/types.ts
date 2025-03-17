import { Dec } from "@keplr-wallet/unit";

export interface SelectUTXOsParams {
  senderAddress: string;
  utxos: UTXO[];
  recipients: IPsbtOutput[];
  feeRate: number;
  isSendMax?: boolean;
}

export interface SelectionParams {
  utxos: UTXO[];
  targetValue: Dec;
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
  isDust: (value: Dec) => boolean;
  outputParams: Record<string, number>;
  timeoutMs?: number;
}

export interface BuildPsbtParams {
  inputs: IPsbtInput[];
  outputs: IPsbtOutput[];
  feeRate: number;
  maximumFeeRate?: number;
  changeAddress?: string;
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

export interface Bip32Derivation {
  masterFingerprint: Buffer;
  pubkey: Buffer;
  path: string;
}

export interface TapBip32Derivation extends Bip32Derivation {
  leafHashes: Buffer[];
}

export interface IPsbtInput {
  txid: string;
  vout: number;
  value: number;
  address: string;
  nonWitnessUtxo?: Buffer;
  tapInternalKey?: Buffer;
  bip32Derivation?: Bip32Derivation[];
  tapBip32Derivation?: TapBip32Derivation[];
  // no script related fields as of now, we don't support multisig
}

export interface IPsbtOutput {
  address: string;
  value: number;
}
