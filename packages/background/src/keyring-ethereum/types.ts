import { BigNumberish, TransactionLike, TransactionReceipt } from "ethers";

export const DELEGATOR_ADDRESS = "0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B"; // Metamask

export type WalletSendCallsRequest = {
  atomicRequired: boolean;
  calls: Call[];
  chainId: string; // hex value, required
  version: string; // api version (current: 1.0)
  id?: string; // optional for user to identify the request
  from?: string; // hex address, optional
  capabilities?: Capabilities; // optional for user to specify the capabilities e.g. paymaster
};

// signEthereum에서 프론트로 넘겨주는 데이터 (message로 전달됨)
export type InternalSendCallsRequest = {
  batchId: string;
  calls: Call[];
  apiVersion: string;
  nonce: number;
  chainCapabilities: ChainCapabilities;
};

export type WalletSendCallsResponse = {
  id: string;
  capabilities?: Capabilities;
};

export type AccountUpgradeInfo = {
  delegatorAddress: string; // 위임 계정 주소
  initCode?: string; // 위임 계정 초기화 코드
};

export type BatchStrategy = "single" | "atomic" | "sequential" | "unavailable";

export type AuthorizationLikeWithoutSignature = {
  address: string;
  nonce: BigNumberish;
  chainId: BigNumberish;
};

export type UnsignedTxLike = Omit<TransactionLike, "authorizationList"> & {
  authorizationList?: AuthorizationLikeWithoutSignature[]; // 현 ethers.js 버전(v6.14.4)에서는 toJSON 시 authorizationList가 소실되는 문제가 있음
};

// 프론트에서 백단으로 넘겨주는 서명 데이터 (res.signingData로 받음)
export interface BatchSigningData {
  strategy: BatchStrategy;
  batchId: string;
  unsignedTxs: UnsignedTxLike[];
}

// signEthereumBatch 메서드의 응답
export interface EthereumBatchSignResponse {
  strategy: BatchStrategy;
  batchId: string;
  signedTxs: string[];
}

export type Call = {
  to?: string; // hex address, optional
  data: string; // hex value, required in case of contract deployment
  value?: string; // hex value, optional
  capabilities?: Capabilities; // Call-specific capability parameters, ignore atm
};

export type AtomicStatus = "unsupported" | "ready" | "supported";

export type AtomicCapability = {
  status: AtomicStatus;
};

export type ChainCapabilities = {
  atomic: AtomicCapability;
  // TODO: support paymaster
  // paymaster?: PaymasterCapability;
  [key: string]: any; // 향후 확장성을 위한 인덱스 시그니처
};

export type Capabilities = {
  [chainId: string]: ChainCapabilities;
};

export enum WalletGetCallStatusResponseStatus {
  Pending = 100, // Batch has been received by the wallet but has not completed execution onchain
  Confirmed = 200, // Batch has been included onchain without reverts
  OffchainFailed = 400, // Batch has not been included onchain and wallet will not retry
  ChainRulesFailed = 500, // Batch reverted completely and only changes related to gas charge may have been included onchain
  PartialChainRulesFailed = 600, // Batch reverted partially and some changes related to batch calls may have been included onchain
}

export type WalletGetCallStatusResponse = {
  version: string;
  chainId: string; // hex value
  id: string;
  status: WalletGetCallStatusResponseStatus;
  atomic: boolean;
  receipts: TransactionReceipt[];
  capabilities?: Capabilities;
};
