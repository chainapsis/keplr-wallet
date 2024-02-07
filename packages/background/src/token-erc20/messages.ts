import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { ERC20TokenInfo } from "./types";
import { AppCurrency } from "@keplr-wallet/types";

export class GetAllERC20TokenInfosMsg extends Message<
  Record<string, ERC20TokenInfo[] | undefined>
> {
  public static type() {
    return "GetAllERC20TokenInfosMsg";
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
    return GetAllERC20TokenInfosMsg.type();
  }
}

export class SuggestERC20TokenMsg extends Message<void> {
  public static type() {
    return "SuggestERC20TokenMsg";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string
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
    return SuggestERC20TokenMsg.type();
  }
}

export class AddERC20TokenMsg extends Message<
  Record<string, ERC20TokenInfo[] | undefined>
> {
  public static type() {
    return "AddERC20TokenMsg";
  }

  constructor(
    public readonly chainId: string,
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
    return AddERC20TokenMsg.type();
  }
}

export class RemoveERC20TokenMsg extends Message<
  Record<string, ERC20TokenInfo[] | undefined>
> {
  public static type() {
    return "RemoveERC20TokenMsg";
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
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveERC20TokenMsg.type();
  }
}
