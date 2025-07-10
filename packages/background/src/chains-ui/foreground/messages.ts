import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class EnabledChainIdentifiersUpdatedMsg extends Message<void> {
  public static type() {
    return "EnabledChainIdentifiersUpdatedMsg";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return EnabledChainIdentifiersUpdatedMsg.type();
  }
}
