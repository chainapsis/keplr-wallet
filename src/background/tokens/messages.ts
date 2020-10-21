import { Message } from "../../common/message";
import { ROUTE } from "./constants";
import { AppCurrency } from "../../common/currency";

export class AddTokenMsg extends Message<void> {
  public static type() {
    return "add-token";
  }

  constructor(
    public readonly chainId: string,
    public readonly currency: AppCurrency
  ) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddTokenMsg.type();
  }
}
