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
