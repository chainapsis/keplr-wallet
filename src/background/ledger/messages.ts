import { Message } from "../../common/message";
import { ROUTE } from "./constants";

export class LedgerInitResumeMsg extends Message<void> {
  public static type() {
    return "ledger-init-resume";
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
    return LedgerInitResumeMsg.type();
  }
}
