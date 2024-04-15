import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class RequestJsonRpcEthereum extends Message<void> {
  public static type() {
    return "request-json-rpc-ethereum";
  }

  constructor(public readonly method: string, public readonly params?: any[]) {
    super();
  }

  validateBasic(): void {}

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestJsonRpcEthereum.type();
  }
}
