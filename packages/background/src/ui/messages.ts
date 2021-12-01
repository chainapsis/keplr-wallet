import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { KeplrSendUIOptions } from "@keplr-wallet/types";

// Result is hex encoded tx hash
export class OpenSendUIMsg extends Message<string> {
  public static type() {
    return "open-send-ui";
  }

  constructor(
    public readonly chainId: string,
    public readonly options?: KeplrSendUIOptions
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return OpenSendUIMsg.type();
  }
}
