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
