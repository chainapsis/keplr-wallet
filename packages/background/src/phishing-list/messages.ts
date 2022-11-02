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

export class URLTempAllowMsg extends Message<void> {
  public static type() {
    return "url-temp-allow";
  }

  constructor(public readonly url: string) {
    super();
  }

  validateBasic(): void {
    const url = new URL(this.url);
    // Will throw an error if url has not second level domain.
    parseDomainUntilSecondLevel(url.origin);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return URLTempAllowMsg.type();
  }
}

export class CheckBadTwitterIdMsg extends Message<boolean> {
  public static type() {
    return "check-bad-twitter-id";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckBadTwitterIdMsg.type();
  }
}
