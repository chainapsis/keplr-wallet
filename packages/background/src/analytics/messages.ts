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

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetAnalyticsIdMsg.type();
  }
}
