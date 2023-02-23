import { Message } from "@keplr-wallet/router";
import { Key } from "@keplr-wallet/types";
import { ROUTE } from "./constants";

export class GetCosmosKeyMsg extends Message<Key> {
  public static type() {
    return "get-cosmos-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetCosmosKeyMsg.type();
  }
}
