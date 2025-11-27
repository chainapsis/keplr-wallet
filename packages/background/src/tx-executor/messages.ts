import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { DirectTxBatch, DirectTx, DirectTxBatchType } from "./types";

/**
 * Record and execute multiple transactions
 * execution id is returned if the transactions are recorded successfully
 * and the execution will be started automatically after the transactions are recorded.
 */
export class RecordAndExecuteDirectTxsMsg extends Message<string> {
  public static type() {
    return "record-and-execute-direct-txs";
  }

  //TODO: add history data...
  constructor(
    public readonly vaultId: string,
    public readonly batchType: DirectTxBatchType,
    public readonly txs: DirectTx[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new KeplrError("direct-tx-executor", 101, "vaultId is empty");
    }

    if (!this.batchType) {
      throw new KeplrError("direct-tx-executor", 102, "batchType is empty");
    }

    if (!this.txs || this.txs.length === 0) {
      throw new KeplrError("direct-tx-executor", 102, "txs is empty");
    }
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RecordAndExecuteDirectTxsMsg.type();
  }
}

/**
 * Resume existing direct transactions by execution id and transaction index
 * This message is used to resume the execution of direct transactions that were paused by waiting for the asset to be bridged or other reasons.
 */
export class ResumeDirectTxsMsg extends Message<void> {
  public static type() {
    return "resume-direct-txs";
  }

  constructor(
    public readonly id: string,
    public readonly txIndex: number,
    // NOTE: these fields are optional for hardware wallet cases
    public readonly signedTx?: Uint8Array,
    public readonly signature?: Uint8Array
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new KeplrError("direct-tx-executor", 101, "id is empty");
    }
    if (!this.txIndex) {
      throw new KeplrError("direct-tx-executor", 103, "txIndex is empty");
    }

    // signedTx and signature should be provided together
    if (this.signedTx && !this.signature) {
      throw new KeplrError("direct-tx-executor", 104, "signature is empty");
    }

    if (!this.signedTx && this.signature) {
      throw new KeplrError("direct-tx-executor", 105, "signedTx is empty");
    }
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ResumeDirectTxsMsg.type();
  }
}

/**
 * Get execution data by execution id
 */
export class GetDirectTxBatchMsg extends Message<DirectTxBatch | undefined> {
  public static type() {
    return "get-direct-tx-batch";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new KeplrError("direct-tx-executor", 101, "id is empty");
    }
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetDirectTxBatchMsg.type();
  }
}

/**
 * Cancel execution by execution id
 */
export class CancelDirectTxsMsg extends Message<void> {
  public static type() {
    return "cancel-direct-txs";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new KeplrError("direct-tx-executor", 101, "id is empty");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CancelDirectTxsMsg.type();
  }
}
