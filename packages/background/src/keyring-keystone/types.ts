export interface MultiAccounts {
  masterFingerprint: string;
  keys: Account[];
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  };
  device?: string;
  deviceId?: string;
  connectionType?: "USB" | "QR";
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
