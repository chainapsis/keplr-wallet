import { Message } from "@keplr-wallet/router";
import { SettledResponses } from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import {
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  TypedData as StarknetTypedData,
} from "starknet";

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
    name: string;
    hexAddress: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    isNanoLedger: boolean;
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

export class RequestSignStarknetTx extends Message<{
  transactions: Call[];
  details: InvocationsSignerDetails;
  signature: string[];
}> {
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

export class RequestSignStarknetMessage extends Message<string[]> {
  public static type() {
    return "request-sign-starknet-message";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly message: StarknetTypedData
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }

    if (!this.signer) {
      throw new Error("signer is not set");
    }

    if (!this.message) {
      throw new Error("message is not set");
    }

    // Validate signer address.
    if (!this.signer.match(/^0x[0-9A-Fa-f]*$/) || this.signer.length !== 66) {
      throw new Error("signer is not valid hex address");
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

export class RequestSignStarknetDeployAccountTx extends Message<{
  transaction: DeployAccountSignerDetails;
  signature: string[];
}> {
  public static type() {
    return "request-sign-starknet-deploy-account-tx";
  }

  constructor(
    public readonly chainId: string,
    public readonly transaction: DeployAccountSignerDetails
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }

    if (!this.transaction) {
      throw new Error("transaction is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignStarknetDeployAccountTx.type();
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

export class GetStarknetKeysForEachVaultSettledMsg extends Message<
  SettledResponses<
    {
      name: string;
      hexAddress: string;
      pubKey: Uint8Array;
      address: Uint8Array;
      isNanoLedger: boolean;
    } & {
      vaultId: string;
    }
  >
> {
  public static type() {
    return "GetStarknetKeysForEachVaultSettledMsg";
  }

  constructor(
    public readonly chainId: string,
    public readonly vaultIds: string[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.vaultIds || this.vaultIds.length === 0) {
      throw new Error("vaultIds are not set");
    }

    const seen = new Map<string, boolean>();

    for (const vaultId of this.vaultIds) {
      if (seen.get(vaultId)) {
        throw new Error(`vaultId ${vaultId} is duplicated`);
      }

      seen.set(vaultId, true);
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetStarknetKeysForEachVaultSettledMsg.type();
  }
}

export class GetStarknetKeyParamsSelectedMsg extends Message<{
  pubKey: Uint8Array;
  starknetPubKey: Uint8Array;
  address: Uint8Array;
  salt: Uint8Array;
  classHash: Uint8Array;
  xLow: Uint8Array;
  xHigh: Uint8Array;
  yLow: Uint8Array;
  yHigh: Uint8Array;
}> {
  public static type() {
    return "get-starknet-key-params-selected";
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
    return GetStarknetKeyParamsSelectedMsg.type();
  }
}

export class PrivilegeStarknetSignClaimRewardsMsg extends Message<{
  transactions: Call[];
  details: InvocationsSignerDetails;
  signature: string[];
}> {
  public static type() {
    return "privilege-starknet-sign-claim-rewards";
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
    return false;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return PrivilegeStarknetSignClaimRewardsMsg.type();
  }
}
