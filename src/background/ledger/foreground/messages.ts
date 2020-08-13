import { Message } from "../../../common/message";
import { ROUTE } from "./constants";

export class LedgerInitFailedMsg extends Message<void> {
  public static type() {
    return "ledger-init-failed";
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerInitFailedMsg.type();
  }
}
