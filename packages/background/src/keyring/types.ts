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

export interface ExportKeyRingData {
  type: "mnemonic" | "privateKey";
  // If the type is private key, the key is encoded as hex.
  key: string;
  coinTypeForChain: CoinTypeForChain;
  bip44HDPath: BIP44HDPath;
  meta: {
    [key: string]: string;
  };
}
