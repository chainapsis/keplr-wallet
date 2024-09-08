import { Message } from "@keplr-wallet/router";
import { SettledResponses } from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import { Call, InvocationsSignerDetails } from "starknet";

export class GetStarknetKeyMsg extends Message<{
  hexAddress: string;
  pubKey: Uint8Array;
  address: Uint8Array;
}> {
  public static type() {
    return "get-starknet-key";
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
    return GetStarknetKeyMsg.type();
  }
}

export class GetStarknetKeysSettledMsg extends Message<
  SettledResponses<{
    hexAddress: string;
    pubKey: Uint8Array;
    address: Uint8Array;
  }>
> {
  public static type() {
    return "get-starknet-keys-settled";
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
    return GetStarknetKeysSettledMsg.type();
  }
}

export class RequestSignStarknetTx extends Message<string[]> {
  public static type() {
    return "request-sign-starknet-tx";
  }

  constructor(
    public readonly chainId: string,
    public readonly transactions: Call[],
    public readonly details: InvocationsSignerDetails
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }

    if (!this.transactions) {
      throw new Error("transactions are not set");
    }

    if (!this.details) {
      throw new Error("details are not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignStarknetTx.type();
  }
}

export class RequestJsonRpcToStarknetMsg extends Message<void> {
  public static type() {
    return "request-json-rpc-to-starknet";
  }

  constructor(
    public readonly method: string,
    public readonly params?: unknown[] | Record<string, unknown>,
    public readonly chainId?: string
  ) {
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
    return RequestJsonRpcToStarknetMsg.type();
  }
}
