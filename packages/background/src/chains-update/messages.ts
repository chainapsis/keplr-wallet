import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class TryUpdateAllChainInfosMsg extends Message<boolean> {
  public static type() {
    return "TryUpdateAllChainInfosMsg";
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
    return TryUpdateAllChainInfosMsg.type();
  }
}

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
