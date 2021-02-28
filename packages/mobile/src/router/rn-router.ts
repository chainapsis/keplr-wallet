import { Router } from "@keplr-wallet/router";

export class RNRouter extends Router {
  listen(_port: string): void {
    throw new Error("TODO: Implement me");
  }

  unlisten(): void {
    throw new Error("TODO: Implement me");
  }
}
