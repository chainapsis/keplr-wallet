import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetAnalyticsIdMsg extends Message<string> {
  public static type() {
    return "get-analytics-id";
  }

  constructor() {
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
    return GetAnalyticsIdMsg.type();
  }
}

export class SetDisableAnalyticsMsg extends Message<boolean> {
  public static type() {
    return "set-disable-analytics";
  }

  constructor(public readonly disabled: boolean) {
    super();
  }

  validateBasic(): void {
    // noop
  }
  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetDisableAnalyticsMsg.type();
  }
}
