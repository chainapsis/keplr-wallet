import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetSidePanelIsSupportedMsg extends Message<{
  supported: boolean;
}> {
  public static type() {
    return "GetSidePanelIsSupportedMsg";
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
    return GetSidePanelIsSupportedMsg.type();
  }
}

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

export class SetSidePanelEnabledMsg extends Message<{
  enabled: boolean;
}> {
  public static type() {
    return "SetSidePanelEnabledMsg";
  }

  constructor(public readonly enabled: boolean) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetSidePanelEnabledMsg.type();
  }
}
