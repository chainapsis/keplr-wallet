import { Env, Message, MessageSender } from "../../common/message";
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
  constructor(
    public readonly chainId: string,
    public readonly txBytes: string,
    public readonly mode: "sync" | "async" | "commit",
    public readonly origin: string
  ) {
    super();
  }

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

  // Approve external approves sending message if they submit their origin correctly.
  // Keeper or handler must check that this origin has right permission.
  approveExternal(env: Env, sender: MessageSender): boolean {
    const isInternal = super.approveExternal(env, sender);
    if (isInternal) {
      return true;
    }

    // TODO: When is a url undefined?
    if (!sender.url) {
      throw new Error("url is empty");
    }

    if (!this.origin) {
      throw new Error("origin is empty");
    }

    const url = new URL(sender.url);
    return url.origin === this.origin;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBackgroundTxMsg.type();
  }
}
