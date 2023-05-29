import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class TryUpdateEnabledChainInfosMsg extends Message<boolean> {
  public static type() {
    return "TryUpdateEnabledChainInfosMsg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return TryUpdateEnabledChainInfosMsg.type();
  }
}
