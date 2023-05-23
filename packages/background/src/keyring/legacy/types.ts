import { KeyStore } from "./crypto";

export type CoinTypeForChain = {
  [identifier: string]: number;
};

export type BIP44HDPath = {
  account: number;
  change: number;
  addressIndex: number;
};

export interface CommonCrypto {
  scrypt: (text: string, params: ScryptParams) => Promise<Uint8Array>;
}

export interface ScryptParams {
  dklen: number;
  salt: string;
  n: number;
  r: number;
  p: number;
}

export type MultiKeyStoreInfoElem = Pick<
  KeyStore,
  "version" | "type" | "meta" | "bip44HDPath" | "coinTypeForChain"
>;
export type MultiKeyStoreInfo = MultiKeyStoreInfoElem[];
export type MultiKeyStoreInfoWithSelectedElem = MultiKeyStoreInfoElem & {
  selected: boolean;
};
export type MultiKeyStoreInfoWithSelected = MultiKeyStoreInfoWithSelectedElem[];
