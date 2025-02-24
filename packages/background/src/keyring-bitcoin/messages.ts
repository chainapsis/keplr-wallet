import { Message } from "@keplr-wallet/router";
import {
  SettledResponses,
  SupportedPaymentType,
  SupportedWitnessVersion,
} from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import { Psbt } from "bitcoinjs-lib";

export class GetBitcoinKeyMsg extends Message<{
  pubKey: Uint8Array;
  payments: {
    payment: SupportedPaymentType;
    witnessVersion: SupportedWitnessVersion;
  }[];
}> {
  public static type() {
    return "get-bitcoin-key";
  }

  constructor(
    public readonly chainId: string,
    public readonly payment?: SupportedPaymentType
  ) {
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
    addresses: {
      address: string;
      paymentType: SupportedPaymentType;
      witnessVersion: SupportedWitnessVersion;
    }[];
    isNanoLedger?: boolean;
  }>
> {
  public static type() {
    return "get-bitcoin-keys-settled";
  }

  constructor(
    public readonly chainConfigs: Array<{
      chainId: string;
      payment: "native-segwit" | "taproot";
    }>
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainConfigs || this.chainConfigs.length === 0) {
      throw new Error("chainConfigs are not set");
    }

    const seen = new Map<string, boolean>();
    for (const config of this.chainConfigs) {
      if (seen.has(config.chainId)) {
        throw new Error(`chainId ${config.chainId} is duplicated`);
      }
      seen.set(config.chainId, true);
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
      addresses: {
        address: string;
        paymentType: SupportedPaymentType;
        witnessVersion: SupportedWitnessVersion;
      }[];
      isLedger?: boolean;
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

export class RequestSignBitcoinPsbtMsg extends Message<{
  signedTxHex: string;
}> {
  public static type() {
    return "request-sign-bitcoin-psbt";
  }

  constructor(
    public readonly chainId: string,
    /** UTXO 리스트, destination, amount, fee 등 필요한 필드들 */
    public readonly psbt: Psbt
  ) {
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
    // 사용자 승인(외부 UI)이 필요한 경우 true
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBitcoinPsbtMsg.type();
  }
}

/**
 * BTCProvider.signPsbts(psbtsHexes: string[])
 */
export class RequestSignBitcoinPsbtsMsg extends Message<{
  signedTxHexes: string[];
}> {
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

export class RequestSignBitcoinMessageMsg extends Message<{
  signatureHex: string;
}> {
  public static type() {
    return "request-sign-bitcoin-message";
  }

  constructor(
    public readonly message: string,
    public readonly signType: "ecdsa" | "bip322-simple"
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.message) {
      throw new Error("message is not set");
    }
    if (!this.signType) {
      throw new Error("signType is not set");
    }
  }

  override approveExternal(): boolean {
    // 메시지 서명은 일반적으로 사용자 확인 있음
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBitcoinMessageMsg.type();
  }
}
