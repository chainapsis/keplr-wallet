import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

// Return the tx hash
export class SendTxMsg extends Message<Uint8Array> {
  public static type() {
    return "send-tx-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly tx: unknown,
    public readonly mode: "async" | "sync" | "block"
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.tx) {
      throw new Error("tx is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new Error("invalid mode");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SendTxMsg.type();
  }
}
