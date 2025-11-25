import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { DirectTxExecutorData } from "./types";

export class GetDirectTxExecutorDataMsg extends Message<DirectTxExecutorData> {
  public static type() {
    return "get-direct-tx-executor-data";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    // Add validation
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetDirectTxExecutorDataMsg.type();
  }
}
