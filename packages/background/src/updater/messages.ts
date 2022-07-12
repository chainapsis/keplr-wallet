import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { ChainInfoWithEmbed } from "../chains";

export class TryUpdateChainMsg extends Message<void> {
  public static type() {
    return "try-update-chain";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("updater", 100, "Empty chain id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return TryUpdateChainMsg.type();
  }
}

export class SetChainEndpointsMsg extends Message<ChainInfoWithEmbed[]> {
  public static type() {
    return "set-chain-endpoints";
  }

  constructor(
    public readonly chainId: string,
    public readonly rpc: string | undefined,
    public readonly rest: string | undefined
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("updater", 100, "Empty chain id");
    }

    if (this.rpc) {
      // Make sure that rpc is valid url form
      const url = new URL(this.rpc);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`RPC has invalid protocol: ${url.protocol}`);
      }
    }
    if (this.rest) {
      // Make sure that rest is valid url form
      const url = new URL(this.rest);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`LCD has invalid protocol: ${url.protocol}`);
      }
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetChainEndpointsMsg.type();
  }
}

export class ResetChainEndpointsMsg extends Message<ChainInfoWithEmbed[]> {
  public static type() {
    return "reset-chain-endpoints";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("updater", 100, "Empty chain id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ResetChainEndpointsMsg.type();
  }
}
