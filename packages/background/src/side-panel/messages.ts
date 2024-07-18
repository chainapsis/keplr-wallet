import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetSidePanelEnabledMsg extends Message<{
  enabled: boolean;
}> {
  public static type() {
    return "GetSidePanelEnabledMsg";
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
    return GetSidePanelEnabledMsg.type();
  }
}
