import EventEmitter from "events";

export enum BitcoinSignMessageType {
  MESSAGE = "message",
  BIP322 = "bip-322",
}

export enum GenesisHash {
  MAINNET = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
  TESTNET = "000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943",
}

export type SupportedNetwork = "mainnet" | "testnet";
export type SupportedPaymentType = "native-segwit" | "taproot";

export const GENESIS_HASH_TO_NETWORK: Record<GenesisHash, SupportedNetwork> = {
  [GenesisHash.MAINNET]: "mainnet",
  [GenesisHash.TESTNET]: "testnet",
};

export interface IBitcoinProvider extends EventEmitter {
  getAccounts: () => Promise<string[]>;
  requestAccounts: () => Promise<string[]>;
  disconnect: () => Promise<void>;
  getNetwork: () => Promise<SupportedNetwork>;
  switchNetwork: (network: SupportedNetwork) => Promise<void>;
  getPublicKey: () => Promise<string>;
  getBalance: () => Promise<string>;
  getInscriptions: () => Promise<string[]>;
  signMessage: (
    message: string,
    type: BitcoinSignMessageType
  ) => Promise<string>;
  sendBitcoin: (to: string, amount: string) => Promise<string>;
  pushTx: (rawTxHex: string) => Promise<string>;
  signPsbt: (psbtHex: string) => Promise<string>;
  signPsbts: (psbtsHexes: string[]) => Promise<string[]>;
}
