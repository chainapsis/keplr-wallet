import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class ReplacePageMsg extends Message<void> {
  public static type() {
    return "replace-page";
  }

  constructor(public readonly url: string) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ReplacePageMsg.type();
  }

  validateBasic(): void {
    // noop
  }
}
