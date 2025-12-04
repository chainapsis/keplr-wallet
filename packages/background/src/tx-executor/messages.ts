import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import {
  BackgroundTx,
  TxExecutionType,
  TxExecutionStatus,
  TxExecution,
  ExecutionTypeToHistoryData,
} from "./types";

/**
 * Record and execute multiple transactions
 * execution id is returned if the transactions are recorded successfully
 * and the execution will be started automatically after the transactions are recorded.
 */
export class RecordAndExecuteTxsMsg<
  T extends TxExecutionType = TxExecutionType
> extends Message<TxExecutionStatus> {
  public static type() {
    return "record-and-execute-txs";
  }

  constructor(
    public readonly vaultId: string,
    public readonly executionType: T,
    public readonly txs: BackgroundTx[],
    public readonly executableChainIds: string[],
    public readonly historyData?: T extends TxExecutionType.UNDEFINED
      ? undefined
      : ExecutionTypeToHistoryData[T],
    public readonly historyTxIndex?: number
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new KeplrError("direct-tx-executor", 101, "vaultId is empty");
    }

    if (!this.executionType) {
      throw new KeplrError("direct-tx-executor", 102, "executionType is empty");
    }

    if (!this.txs || this.txs.length === 0) {
      throw new KeplrError("direct-tx-executor", 102, "txs is empty");
    }

    if (!this.executableChainIds || this.executableChainIds.length === 0) {
      throw new KeplrError(
        "direct-tx-executor",
        103,
        "executableChainIds is empty"
      );
    }

    if (this.historyTxIndex != null && this.historyTxIndex < 0) {
      throw new KeplrError(
        "direct-tx-executor",
        104,
        "historyTxIndex is invalid"
      );
    }
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RecordAndExecuteTxsMsg.type();
  }
}

/**
 * Resume existing direct transactions by execution id and transaction index
 * This message is used to resume the execution of direct transactions that were paused by waiting for the asset to be bridged or other reasons.
 */
export class ResumeTxMsg extends Message<TxExecutionStatus> {
  public static type() {
    return "resume-tx";
  }

  constructor(
    public readonly id: string,
    public readonly txIndex?: number,
    // NOTE: these fields are optional for hardware wallet cases
    public readonly signedTx?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new KeplrError("direct-tx-executor", 101, "id is empty");
    }

    if (this.txIndex != null && this.txIndex < 0) {
      throw new KeplrError("direct-tx-executor", 103, "txIndex is invalid");
    }

    if (this.signedTx != null && this.signedTx.length === 0) {
      throw new KeplrError("direct-tx-executor", 104, "signedTx is empty");
    }
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ResumeTxMsg.type();
  }
}

/**
 * Get execution data by execution id
 */
export class GetTxExecutionMsg extends Message<TxExecution | undefined> {
  public static type() {
    return "get-tx-execution";
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
    return GetTxExecutionMsg.type();
  }
}

/**
 * Cancel execution by execution id
 */
export class CancelTxExecutionMsg extends Message<void> {
  public static type() {
    return "cancel-tx-execution";
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
    return CancelTxExecutionMsg.type();
  }
}
