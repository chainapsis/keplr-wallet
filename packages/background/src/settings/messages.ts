import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetThemeOptionMsg extends Message<string> {
  public static type() {
    return "GetThemeOptionMsg";
  }

  constructor() {
    super();
  }

  override approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetThemeOptionMsg.type();
  }
}

export class SetThemeOptionMsg extends Message<void> {
  public static type() {
    return "SetThemeOptionMsg";
  }

  constructor(public readonly themeOption: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetThemeOptionMsg.type();
  }
}
