import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { TokenInfo } from "./types";
import { AppCurrency } from "@keplr-wallet/types";

export class GetAllTokenInfosMsg extends Message<
  Record<string, TokenInfo[] | undefined>
> {
  public static type() {
    return "GetAllTokenInfosMsg";
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
    return GetAllTokenInfosMsg.type();
  }
}

export class SuggestTokenMsg extends Message<void> {
  public static type() {
    return "SuggestTokenMsg";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string,
    public readonly viewingKey?: string
  ) {
    super();
  }

  override approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tokens", 100, "Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new KeplrError("tokens", 101, "Contract address is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SuggestTokenMsg.type();
  }
}

export class AddTokenMsg extends Message<
  Record<string, TokenInfo[] | undefined>
> {
  public static type() {
    return "AddTokenMsg";
  }

  constructor(
    public readonly chainId: string,
    // Should be hex encoded. (not bech32)
    public readonly associatedAccountAddress: string,
    public readonly currency: AppCurrency
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tokens", 100, "Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddTokenMsg.type();
  }
}

export class RemoveTokenMsg extends Message<
  Record<string, TokenInfo[] | undefined>
> {
  public static type() {
    return "RemoveTokenMsg";
  }

  constructor(
    public readonly chainId: string,
    // Should be hex encoded. (not bech32)
    public readonly associatedAccountAddress: string,
    public readonly contractAddress: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tokens", 100, "Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveTokenMsg.type();
  }
}

export class GetSecret20ViewingKey extends Message<string> {
  public static type() {
    return "get-secret20-viewing-key";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tokens", 100, "Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new KeplrError("tokens", 101, "Contract address is empty");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSecret20ViewingKey.type();
  }
}
