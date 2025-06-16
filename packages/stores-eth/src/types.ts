import { Transaction } from "ethers";

export type UnsignedEVMTransaction = Transaction;

export class UnsignedEVMTransactionWithErc20Approvals extends Transaction {
  requiredErc20Approvals?: {
    amount: string;
    spender: string;
    tokenAddress: string;
  }[];

  constructor(
    tx: UnsignedEVMTransaction,
    approvals?: {
      amount: string;
      spender: string;
      tokenAddress: string;
    }[]
  ) {
    super();

    // to make sure the tx is unsigned
    const unsignedTx = Transaction.from(tx.unsignedSerialized);

    this.type = unsignedTx.type;
    this.to = unsignedTx.to;
    this.nonce = unsignedTx.nonce;
    this.gasLimit = unsignedTx.gasLimit;
    this.gasPrice = unsignedTx.gasPrice;
    this.maxPriorityFeePerGas = unsignedTx.maxPriorityFeePerGas;
    this.maxFeePerGas = unsignedTx.maxFeePerGas;
    this.data = unsignedTx.data;
    this.value = unsignedTx.value;
    this.chainId = unsignedTx.chainId;
    this.accessList = unsignedTx.accessList;
    this.maxFeePerBlobGas = unsignedTx.maxFeePerBlobGas;
    this.blobVersionedHashes = unsignedTx.blobVersionedHashes;
    this.kzg = unsignedTx.kzg;
    this.blobs = unsignedTx.blobs;
    this.authorizationList = unsignedTx.authorizationList;
    this.requiredErc20Approvals = approvals;
  }
}
