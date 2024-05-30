import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { AllPermissionDataPerOrigin } from "./types";

export class GetPermissionOriginsMsg extends Message<string[]> {
  public static type() {
    return "get-permission-origins";
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("permission", 100, "chain id not set");
    }

    if (!this.permissionType) {
      throw new KeplrError("permission", 110, "empty permission type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetPermissionOriginsMsg.type();
  }
}

export class GetOriginPermittedChainsMsg extends Message<string[]> {
  public static type() {
    return "get-origin-permitted-chains";
  }

  constructor(
    public readonly permissionOrigin: string,
    public readonly permissionType: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.permissionOrigin) {
      throw new KeplrError("permission", 101, "origin not set");
    }

    if (!this.permissionType) {
      throw new KeplrError("permission", 110, "empty permission type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetOriginPermittedChainsMsg.type();
  }
}

export class GetGlobalPermissionOriginsMsg extends Message<string[]> {
  public static type() {
    return "get-global-permission-origins";
  }

  constructor(public readonly permissionType: string) {
    super();
  }

  validateBasic(): void {
    if (!this.permissionType) {
      throw new KeplrError("permission", 110, "empty permission type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetGlobalPermissionOriginsMsg.type();
  }
}

export class AddPermissionOrigin extends Message<void> {
  public static type() {
    return "add-permission-origin";
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string,
    public readonly permissionOrigin: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("permission", 100, "chain id not set");
    }

    if (!this.permissionType) {
      throw new KeplrError("permission", 110, "empty permission type");
    }

    if (!this.permissionOrigin) {
      throw new KeplrError("permission", 111, "empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddPermissionOrigin.type();
  }
}

export class RemovePermissionOrigin extends Message<void> {
  public static type() {
    return "remove-permission-origin";
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string,
    public readonly permissionOrigin: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("permission", 100, "chain id not set");
    }

    if (!this.permissionType) {
      throw new KeplrError("permission", 110, "empty permission type");
    }

    if (!this.permissionOrigin) {
      throw new KeplrError("permission", 111, "empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemovePermissionOrigin.type();
  }
}

export class RemoveGlobalPermissionOriginMsg extends Message<void> {
  public static type() {
    return "remove-global-permission-origin";
  }

  constructor(
    public readonly permissionType: string,
    public readonly permissionOrigin: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.permissionType) {
      throw new KeplrError("permission", 110, "empty permission type");
    }

    if (!this.permissionOrigin) {
      throw new KeplrError("permission", 111, "empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveGlobalPermissionOriginMsg.type();
  }
}

export class ClearOriginPermissionMsg extends Message<void> {
  public static type() {
    return "clear-origin-permission";
  }

  constructor(public readonly permissionOrigin: string) {
    super();
  }

  validateBasic(): void {
    if (!this.permissionOrigin) {
      throw new KeplrError("permission", 111, "empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ClearOriginPermissionMsg.type();
  }
}

export class ClearAllPermissionsMsg extends Message<void> {
  public static type() {
    return "clear-all-permissions";
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
    return ClearAllPermissionsMsg.type();
  }
}

export class GetAllPermissionDataPerOriginMsg extends Message<AllPermissionDataPerOrigin> {
  public static type() {
    return "get-all-permission-data-per-origin";
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
    return GetAllPermissionDataPerOriginMsg.type();
  }
}

export class GetCurrentChainIdForEVMMsg extends Message<string | undefined> {
  public static type() {
    return "get-current-chain-id-for-evm";
  }

  constructor(public readonly permissionOrigin: string) {
    super();
  }

  validateBasic(): void {
    if (!this.permissionOrigin) {
      throw new KeplrError("permission", 111, "empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetCurrentChainIdForEVMMsg.type();
  }
}

export class UpdateCurrentChainIdForEVMMsg extends Message<void> {
  public static type() {
    return "update-current-chain-id-for-evm";
  }

  constructor(
    public readonly permissionOrigin: string,
    public readonly chainId: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.permissionOrigin) {
      throw new KeplrError("permission", 111, "empty permission origin");
    }

    if (!this.chainId) {
      throw new KeplrError("permission", 100, "chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateCurrentChainIdForEVMMsg.type();
  }
}
