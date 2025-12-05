import { UnsignedTransaction } from "@ethersproject/transactions";

export type UnsignedEVMTransaction = UnsignedTransaction;

export type UnsignedEVMTransactionWithErc20Approvals =
  UnsignedEVMTransaction & {
    requiredErc20Approvals?: {
      amount: string;
      spender: string;
      tokenAddress: string;
    }[];
  };

export interface AccountState {
  balance?: string;
  code?: string;
  nonce?: string;
  storage?: Record<string, string>;
}

export interface AccountStateDiffTracerResult {
  pre: Record<string, AccountState>;
  post: Record<string, AccountState>;
}

export type SimulateGasWithPendingErc20ApprovalResult =
  | {
      kind: "no-pending-approval";
      hasPendingErc20Approval: false;
      mainTxSimulated: true;
      gasUsed: number;
      erc20ApprovalGasUsed?: undefined;
    }
  | {
      kind: "tx-bundle-simulated";
      hasPendingErc20Approval: true;
      mainTxSimulated: true;
      gasUsed: number;
      erc20ApprovalGasUsed: number;
    }
  | {
      kind: "tx-bundle-tracing-fallback";
      hasPendingErc20Approval: true;
      mainTxSimulated: false;
      gasUsed: number;
      erc20ApprovalGasUsed: number;
    };

export interface StateOverrideAccountState {
  balance?: string;
  nonce?: string; // hex string for stateOverride
  code?: string;
  storage?: Record<string, string>;
  state?: Record<string, string>;
  stateDiff?: Record<string, string>;
}

export type StateOverride = Record<string, StateOverrideAccountState>;
