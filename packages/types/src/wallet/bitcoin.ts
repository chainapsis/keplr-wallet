export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  SIGNET = "signet",
}

export enum SupportedPaymentType {
  NATIVE_SEGWIT = "native-segwit",
  TAPROOT = "taproot",
}

export enum SupportedWitnessVersion {
  WITNESS_V0 = 0, // native segwit
  WITNESS_V1 = 1, // taproot
}

export type Fees = {
  // fee for inclusion in the next block
  fastestFee: number;
  // fee for inclusion in a block in 30 mins
  halfHourFee: number;
  // fee for inclusion in a block in 1 hour
  hourFee: number;
  // economy fee: inclusion not guaranteed
  economyFee: number;
  // minimum fee: the minimum fee of the network
  minimumFee: number;
};

// UTXO is a structure defining attributes for a UTXO
export interface UTXO {
  // hash of transaction that holds the UTXO
  txid: string;
  // index of the output in the transaction
  vout: number;
  // amount of satoshis the UTXO holds
  value: number;
  // the script that the UTXO contains
  scriptPubKey: string;
}

export interface InscriptionResult {
  list: Inscription[];
  total: number;
}

export interface Inscription {
  output: string;
  inscriptionId: string;
  address: string;
  offset: number;
  outputValue: number;
  location: string;
  contentType: string;
  contentLength: number;
  inscriptionNumber: number;
  timestamp: number;
  genesisTransaction: string;
}

export interface IBitcoinProvider {
  connectWallet(): Promise<this>;
  getAddress(): Promise<string>;
  getPublicKeyHex(): Promise<string>;
  signPsbt(psbtHex: string): Promise<string>;
  signPsbts(psbtsHexes: string[]): Promise<string[]>;
  getNetwork(): Promise<Network>;
  signMessage(
    message: string,
    type: "ecdsa" | "bip322-simple"
  ): Promise<string>;
  on(eventName: string, callBack: () => void): void;
  off(eventName: string, callBack: () => void): void;
  switchNetwork(network: Network): Promise<void>;
  sendBitcoin(to: string, satAmount: number): Promise<string>;
  getNetworkFees(): Promise<Fees>;
  pushTx(txHex: string): Promise<string>;
  getUtxos(address: string, amount?: number): Promise<UTXO[]>;
  getBTCTipHeight(): Promise<number>;
  getBalance(): Promise<number>;
  getInscriptions(cursor?: number, size?: number): Promise<InscriptionResult>;
}
