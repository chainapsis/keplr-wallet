import { Message } from "@keplr-wallet/router";
import {
  BitcoinSignMessageType,
  SettledResponses,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import { Psbt } from "bitcoinjs-lib";

export class GetBitcoinKeyMsg extends Message<{
  name: string;
  pubKey: Uint8Array;
  address: string;
  paymentType: SupportedPaymentType;
  isNanoLedger: boolean;
}> {
  public static type() {
    return "get-bitcoin-key";
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
    return GetBitcoinKeyMsg.type();
  }
}

export class GetBitcoinKeysSettledMsg extends Message<
  SettledResponses<{
    name: string;
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
    isNanoLedger: boolean;
  }>
> {
  public static type() {
    return "get-bitcoin-keys-settled";
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
      if (seen.has(chainId)) {
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
    return GetBitcoinKeysSettledMsg.type();
  }
}

export class GetBitcoinKeysForEachVaultSettledMsg extends Message<
  SettledResponses<
    {
      name: string;
      pubKey: Uint8Array;
      address: string;
      paymentType: SupportedPaymentType;
      isNanoLedger: boolean;
    } & {
      vaultId: string;
    }
  >
> {
  public static type() {
    return "get-bitcoin-keys-for-each-vault-settled";
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
      if (seen.has(vaultId)) {
        throw new Error(`vaultId ${vaultId} is duplicated`);
      }
      seen.set(vaultId, true);
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetBitcoinKeysForEachVaultSettledMsg.type();
  }
}

export class RequestSignBitcoinPsbtMsg extends Message<string> {
  public static type() {
    return "request-sign-bitcoin-psbt";
  }

  constructor(public readonly chainId: string, public readonly psbt: Psbt) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
    if (!this.psbt) {
      throw new Error("psbt is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBitcoinPsbtMsg.type();
  }
}

export class RequestSignBitcoinPsbtsMsg extends Message<string[]> {
  public static type() {
    return "request-sign-bitcoin-psbts";
  }

  constructor(public readonly chainId: string, public readonly psbts: Psbt[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
    if (!this.psbts || this.psbts.length === 0) {
      throw new Error("psbts are not set or empty");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBitcoinPsbtsMsg.type();
  }
}

export class RequestSignBitcoinMessageMsg extends Message<string> {
  public static type() {
    return "request-sign-bitcoin-message";
  }

  constructor(
    public readonly chainId: string,
    public readonly message: string,
    public readonly signType: BitcoinSignMessageType
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
    if (!this.message) {
      throw new Error("message is not set");
    }
    if (!this.signType) {
      throw new Error("signType is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBitcoinMessageMsg.type();
  }
}

export class GetSupportedPaymentTypesMsg extends Message<
  SupportedPaymentType[]
> {
  public static type() {
    return "get-supported-payment-types";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSupportedPaymentTypesMsg.type();
  }
}
