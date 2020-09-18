import { Message } from "../../../common/message";
import { ROUTE } from "./constants";

export class TxCommittedMsg extends Message<void> {
  public static type() {
    return "tx-committed";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return TxCommittedMsg.type();
  }
}
