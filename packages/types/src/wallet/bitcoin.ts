import EventEmitter from "events";

export enum BitcoinSignMessageType {
  MESSAGE = "message",
  BIP322 = "bip-322",
}

export enum GenesisHash {
  MAINNET = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
  TESTNET = "000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943",
  SIGNET = "00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6",
}

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  SIGNET = "signet",
}

export type SupportedPaymentType = "native-segwit" | "taproot";

export const GENESIS_HASH_TO_NETWORK: Record<GenesisHash, Network> = {
  [GenesisHash.MAINNET]: Network.MAINNET,
  [GenesisHash.TESTNET]: Network.TESTNET,
  [GenesisHash.SIGNET]: Network.SIGNET,
};

export const NETWORK_TO_GENESIS_HASH: Record<Network, GenesisHash> = {
  [Network.MAINNET]: GenesisHash.MAINNET,
  [Network.TESTNET]: GenesisHash.TESTNET,
  [Network.SIGNET]: GenesisHash.SIGNET,
};

export interface IBitcoinProvider extends EventEmitter {
  getAccounts: () => Promise<string[]>;
  requestAccounts: () => Promise<string[]>;
  disconnect: () => Promise<void>;
  getNetwork: () => Promise<Network>;
  switchNetwork: (network: Network) => Promise<void>;
  getPublicKey: () => Promise<string>;
  getBalance: () => Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }>;
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
