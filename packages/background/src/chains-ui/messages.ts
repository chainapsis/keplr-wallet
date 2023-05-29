import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetEnabledChainIdentifiersMsg extends Message<string[]> {
  public static type() {
    return "get-enabled-chain-identifiers";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vaultId is not set");
    }
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
  constructor(
    public readonly vaultId: string,
    public readonly chainIds: string[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vaultId is not set");
    }

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
  constructor(
    public readonly vaultId: string,
    public readonly chainIds: string[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vaultId is not set");
    }

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
  constructor(
    public readonly vaultId: string,
    public readonly chainIds: string[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vaultId is not set");
    }

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

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DisableChainsMsg.type();
  }
}

export class GetVaultsByEnabledChainMsg extends Message<string[]> {
  public static type() {
    return "chains-ui-get-vaults-by-enabled-chain";
  }
  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetVaultsByEnabledChainMsg.type();
  }
}
