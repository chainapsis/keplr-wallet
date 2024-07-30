export enum EthSignType {
  MESSAGE = "message",
  TRANSACTION = "transaction",
  EIP712 = "eip-712",
}

export interface EthTxLog {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
  data: string;
  topics: Array<string>;
  transactionHash: string;
  logIndex: number;
}

export enum EthTxStatus {
  Success = "0x1",
  Failure = "0x0",
}

export interface EthTxReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  root?: string;
  gasUsed: string | number | bigint | BigInteger;
  logsBloom: string;
  blockHash: string;
  transactionHash: string;
  logs: Array<EthTxLog>;
  blockNumber: number;
  confirmations: number;
  cumulativeGasUsed: string | number | bigint | BigInteger;
  effectiveGasPrice: string | number | bigint | BigInteger;
  byzantium: boolean;
  type: number;
  status?: EthTxStatus;
}

export interface EVMInfo {
  chainId: number;
  rpc: string;
  websocket?: string;
}

export interface EthereumSignResponse {
  signingData: Uint8Array;
  signature: Uint8Array;
}
