import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class RequestSignBitcoinMessage extends Message<string[]> {
  public static type() {
    return "request-sign-bitcoin-message";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly message: string // TODO: use typed data
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }

    if (!this.signer) {
      throw new Error("signer is not set");
    }

    if (!this.message) {
      throw new Error("message is not set");
    }

    // TODO: validate address
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBitcoinMessage.type();
  }
}
