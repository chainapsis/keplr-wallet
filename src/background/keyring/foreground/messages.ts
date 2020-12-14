import { Message } from "../../../common/message";
import { ROUTE } from "./constants";

export class KeyStoreChangedMsg extends Message<void> {
  public static type() {
    return "key-store-changed";
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return KeyStoreChangedMsg.type();
  }
}
