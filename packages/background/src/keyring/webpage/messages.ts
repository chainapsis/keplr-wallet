import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class KeyStoreChangedEventMsg extends Message<void> {
  public static type() {
    return "keystore-changed";
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return KeyStoreChangedEventMsg.type();
  }
}
