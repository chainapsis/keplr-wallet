import { Message } from "../../common/message";
import { ROUTE } from "./constants";
import { AppCurrency } from "../../common/currency";

export class SuggestTokenMsg extends Message<void> {
  public static type() {
    return "suggest-token";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string
  ) {
    super();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new Error("Contract address is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SuggestTokenMsg.type();
  }
}

export class ApproveSuggestedTokenMsg extends Message<void> {
  public static type() {
    return "approve-suggested-token";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveSuggestedTokenMsg.type();
  }
}

export class RejectSuggestedTokenMsg extends Message<void> {
  public static type() {
    return "reject-suggested-token";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSuggestedTokenMsg.type();
  }
}

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
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddTokenMsg.type();
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
      throw new Error("Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new Error("Contract address is empty");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSecret20ViewingKey.type();
  }
}
