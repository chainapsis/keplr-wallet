import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { GetTransactionReceiptResponse } from "starknet";

// Return the tx hash
export class SendTxMsg extends Message<Uint8Array> {
  public static type() {
    return "send-tx-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly tx: unknown,
    public readonly mode: "async" | "sync" | "block",
    public readonly silent?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tx", 100, "chain id is empty");
    }

    if (!this.tx) {
      throw new KeplrError("tx", 101, "tx is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new KeplrError("tx", 120, "invalid mode");
    }
  }

  override approveExternal(): boolean {
    // Silent mode is only allowed for the internal txs.
    return !this.silent;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SendTxMsg.type();
  }
}

export class SubmitStarknetTxHashMsg extends Message<GetTransactionReceiptResponse> {
  public static type() {
    return "submit-starknet-tx-hash";
  }

  constructor(public readonly chainId: string, public readonly txHash: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tx", 100, "chain id is empty");
    }

    if (!this.txHash) {
      throw new KeplrError("tx", 101, "tx hash is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitStarknetTxHashMsg.type();
  }
}
