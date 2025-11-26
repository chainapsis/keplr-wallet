import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import {
  DirectTxsExecutionData,
  DirectTxsExecutionResult,
  DirectTx,
} from "./types";

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
    public readonly txs: DirectTx[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new KeplrError("direct-tx-executor", 101, "vaultId is empty");
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
 * Execute existing direct transaction by execution id and transaction index
 * Tx hash is returned if the transaction is executed successfully
 */
export class ExecuteDirectTxMsg extends Message<string> {
  public static type() {
    return "execute-existing-direct-tx";
  }

  constructor(
    public readonly id: string,
    public readonly vaultId: string,
    public readonly txIndex: number
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new KeplrError("direct-tx-executor", 101, "id is empty");
    }
    if (!this.vaultId) {
      throw new KeplrError("direct-tx-executor", 102, "vaultId is empty");
    }
    if (!this.txIndex) {
      throw new KeplrError("direct-tx-executor", 103, "txIndex is empty");
    }
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ExecuteDirectTxMsg.type();
  }
}

/**
 * Get execution data by execution id
 */
export class GetDirectTxsExecutionDataMsg extends Message<DirectTxsExecutionData> {
  public static type() {
    return "get-direct-txs-execution-data";
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
    return GetDirectTxsExecutionDataMsg.type();
  }
}

/**
 * Get execution result by execution id
 */
export class GetDirectTxsExecutionResultMsg extends Message<DirectTxsExecutionResult> {
  public static type() {
    return "get-direct-txs-execution-result";
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
    return GetDirectTxsExecutionResultMsg.type();
  }
}

/**
 * Cancel execution by execution id
 */
export class CancelDirectTxsExecutionMsg extends Message<void> {
  public static type() {
    return "cancel-direct-txs-execution";
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
    return CancelDirectTxsExecutionMsg.type();
  }
}
