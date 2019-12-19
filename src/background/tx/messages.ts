import { Message } from "../../common/message";
import { ROUTE } from "./constants";

export class RequestBackgroundTxMsg extends Message<{}> {
  public static type() {
    return "request-background-tx";
  }

  /**
   * @param chainId Chain id
   * @param txBytes Hex encoded bytes for tx
   * @param mode Broadcast mode
   */
  public static create(
    chainId: string,
    txBytes: string,
    mode: "sync" | "async" | "commit" = "commit"
  ): RequestBackgroundTxMsg {
    const msg = new RequestBackgroundTxMsg();
    msg.chainId = chainId;
    msg.txBytes = txBytes;
    msg.mode = mode;
    return msg;
  }

  public chainId: string = "";
  public txBytes: string = "";
  public mode?: "sync" | "async" | "commit";

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.txBytes) {
      throw new Error("tx bytes is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "commit")
    ) {
      throw new Error("invalid mode");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBackgroundTxMsg.type();
  }
}
