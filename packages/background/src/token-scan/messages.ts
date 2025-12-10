import { Message } from "@keplr-wallet/router";
import { TokenScan } from "./service";
import { ROUTE } from "./constants";

export class GetTokenScansMsg extends Message<TokenScan[]> {
  public static type() {
    return "get-token-scans";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("Empty vault id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetTokenScansMsg.type();
  }
}

export class RevalidateTokenScansMsg extends Message<{
  vaultId: string;
  tokenScans: TokenScan[];
}> {
  public static type() {
    return "revalidate-token-scans";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("Empty vault id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RevalidateTokenScansMsg.type();
  }
}

export class SyncTokenScanInfosMsg extends Message<{
  vaultId: string;
  tokenScans: TokenScan[];
}> {
  public static type() {
    return "sync-token-scan-infos";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("Empty vault id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SyncTokenScanInfosMsg.type();
  }
}

export class GetIsShowNewTokenFoundInMainMsg extends Message<boolean> {
  public static type() {
    return "get-is-show-new-token-found-in-main";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("Empty vault id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetIsShowNewTokenFoundInMainMsg.type();
  }
}

export class UpdateIsShowNewTokenFoundInMainMsg extends Message<boolean> {
  public static type() {
    return "update-is-show-new-token-found-in-main";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("Empty vault id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateIsShowNewTokenFoundInMainMsg.type();
  }
}

export class DismissNewTokenFoundInMainMsg extends Message<boolean> {
  public static type() {
    return "dismiss-new-token-found-in-main";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("Empty vault id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DismissNewTokenFoundInMainMsg.type();
  }
}
