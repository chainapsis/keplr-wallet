import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { parseDomainUntilSecondLevel } from "./utils";

export class CheckURLIsPhishingMsg extends Message<boolean> {
  public static type() {
    return "check-url-is-phishing";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    const url = new URL(this.origin);
    if (url.protocol === "chrome-extension:") return;

    // Will throw an error if url has not second level domain.
    parseDomainUntilSecondLevel(url.origin);
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckURLIsPhishingMsg.type();
  }
}
