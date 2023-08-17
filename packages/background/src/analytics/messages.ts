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

export class LogAnalyticsEventMsg extends Message<void> {
  public static type() {
    return "log-analytics-event";
  }

  constructor(
    public readonly event: string,
    public readonly params: Record<
      string,
      number | string | boolean | number[] | string[] | undefined
    >
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.event) {
      throw new Error("Empty event");
    }
  }
  route(): string {
    return ROUTE;
  }

  type(): string {
    return LogAnalyticsEventMsg.type();
  }
}
