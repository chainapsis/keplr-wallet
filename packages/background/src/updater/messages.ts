import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class TryUpdateChainMsg extends Message<void> {
  public static type() {
    return "try-update-chain";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("updater", 100, "Empty chain id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return TryUpdateChainMsg.type();
  }
}
