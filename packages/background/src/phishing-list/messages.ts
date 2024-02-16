import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { parseDomain } from "./utils";

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
    parseDomain(url.origin);
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckURLIsPhishingMsg.type();
  }
}

export class CheckURLIsPhishingOnMobileMsg extends Message<boolean> {
  public static type() {
    return "check-url-is-phishing-on-mobile";
  }

  constructor(public readonly url: string) {
    super();
  }

  validateBasic(): void {
    const url = new URL(this.url);

    // Will throw an error if url has not second level domain.
    parseDomain(url.origin);
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckURLIsPhishingOnMobileMsg.type();
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
    parseDomain(url.origin);
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return URLTempAllowMsg.type();
  }
}

export class URLTempAllowOnMobileMsg extends Message<void> {
  public static type() {
    return "url-temp-allow-on-mobile";
  }

  constructor(
    public readonly currentUrl: string,
    public readonly originUrl: string
  ) {
    super();
  }

  validateBasic(): void {
    const url = new URL(this.originUrl);
    // Will throw an error if url has not second level domain.
    parseDomain(url.origin);
  }

  override approveExternal(): boolean {
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return URLTempAllowOnMobileMsg.type();
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

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckBadTwitterIdMsg.type();
  }
}
