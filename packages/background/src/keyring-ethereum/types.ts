import { TransactionReceipt } from "ethers";

export type WalletSendCallsRequest = {
  atomicRequired: boolean;
  calls: Call[];
  chainId: string; // hex value, required
  version: string; // api version (current: 1.0)
  id?: string; // optional for user to identify the request
  from?: string; // hex address, optional
  capabilities?: Capabilities; // optional for user to specify the capabilities e.g. paymaster
};

export type InternalSendCallsRequest = {
  id: string;
  calls: Call[];
  apiVersion: string;
  atomicRequired: boolean;
};

export type WalletSendCallsResponse = {
  id: string;
  capabilities?: Capabilities;
};

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
