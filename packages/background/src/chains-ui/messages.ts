import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetEnabledChainIdentifiersMsg extends Message<string[]> {
  public static type() {
    return "get-enabled-chain-identifiers";
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetEnabledChainIdentifiersMsg.type();
  }
}

export class ToggleChainsMsg extends Message<string[]> {
  public static type() {
    return "chains-ui-toggle-chains";
  }
  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ToggleChainsMsg.type();
  }
}

export class EnableChainsMsg extends Message<string[]> {
  public static type() {
    return "chains-ui-enable-chains";
  }
  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return EnableChainsMsg.type();
  }
}

export class DisableChainsMsg extends Message<string[]> {
  public static type() {
    return "chains-ui-disable-chains";
  }
  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DisableChainsMsg.type();
  }
}
