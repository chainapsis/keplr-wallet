import { Message } from "@keplr-wallet/router";
import { Key, SettledResponses } from "@keplr-wallet/types";
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

export class GetCosmosKeysSettledMsg extends Message<SettledResponses<Key>> {
  public static type() {
    return "get-cosmos-keys-settled";
  }

  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainIds || this.chainIds.length === 0) {
      throw new Error("chainIds are not set");
    }

    const seen = new Map<string, boolean>();

    for (const chainId of this.chainIds) {
      if (seen.get(chainId)) {
        throw new Error(`chainId ${chainId} is duplicated`);
      }

      seen.set(chainId, true);
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetCosmosKeysSettledMsg.type();
  }
}
