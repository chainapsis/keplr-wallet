export interface MultiAccounts {
  masterFingerprint: string;
  keys: Account[];
  device?: string;
  deviceId?: string;
}

export interface Account {
  chain: string;
  path: string;
  publicKey: string;
  name?: string;
  chainCode: string;
  extendedPublicKey?: string;
  xfp?: string;
  note?: string;
}
