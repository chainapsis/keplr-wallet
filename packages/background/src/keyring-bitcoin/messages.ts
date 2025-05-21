import { Message } from "@keplr-wallet/router";
import {
  BitcoinSignMessageType,
  SettledResponses,
  SignPsbtOptions,
  SupportedPaymentType,
  Network as BitcoinNetwork,
  ChainType as BitcoinChainType,
} from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import { Psbt } from "bitcoinjs-lib";

export class GetBitcoinKeyMsg extends Message<{
  name: string;
  pubKey: Uint8Array;
  address: string;
  paymentType: SupportedPaymentType;
  isNanoLedger: boolean;
  masterFingerprintHex?: string;
  derivationPath?: string;
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
    masterFingerprintHex?: string;
    derivationPath?: string;
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
      masterFingerprintHex?: string;
      derivationPath?: string;
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

  constructor(
    public readonly psbtHex: string,
    public readonly options?: SignPsbtOptions,
    public readonly chainId?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.psbtHex) {
      throw new Error("psbtHex is not set");
    }

    try {
      Psbt.fromHex(this.psbtHex);
    } catch (e) {
      throw new Error("Invalid psbtHex");
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

  constructor(
    public readonly psbtsHexes: string[],
    public readonly options?: SignPsbtOptions,
    public readonly chainId?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.psbtsHexes || this.psbtsHexes.length === 0) {
      throw new Error("psbtsHexes are not set or empty");
    }

    for (const psbtHex of this.psbtsHexes) {
      try {
        Psbt.fromHex(psbtHex);
      } catch (e) {
        throw new Error("Invalid psbtHex");
      }
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
    public readonly message: string,
    public readonly signType?: BitcoinSignMessageType,
    public readonly chainId?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.message) {
      throw new Error("message is not set");
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

export class RequestBitcoinGetAccountsMsg extends Message<string[]> {
  public static type() {
    return "request-bitcoin-get-accounts";
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
    return RequestBitcoinGetAccountsMsg.type();
  }
}

export class RequestBitcoinRequestAccountsMsg extends Message<string[]> {
  public static type() {
    return "request-bitcoin-request-accounts";
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
    return RequestBitcoinRequestAccountsMsg.type();
  }
}

export class RequestBitcoinDisconnectMsg extends Message<void> {
  public static type() {
    return "request-bitcoin-disconnect";
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
    return RequestBitcoinDisconnectMsg.type();
  }
}

export class RequestBitcoinGetNetworkMsg extends Message<BitcoinNetwork> {
  public static type() {
    return "request-bitcoin-get-network";
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
    return RequestBitcoinGetNetworkMsg.type();
  }
}

export class RequestBitcoinSwitchNetworkMsg extends Message<BitcoinNetwork> {
  public static type() {
    return "request-bitcoin-switch-network";
  }

  constructor(public readonly network: BitcoinNetwork) {
    super();
  }

  validateBasic(): void {
    if (!this.network) {
      throw new Error("network is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBitcoinSwitchNetworkMsg.type();
  }
}

export class RequestBitcoinGetChainMsg extends Message<{
  enum: BitcoinChainType;
  name: string;
  network: BitcoinNetwork;
}> {
  public static type() {
    return "request-bitcoin-get-chain";
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
    return RequestBitcoinGetChainMsg.type();
  }
}

export class RequestBitcoinSwitchChainMsg extends Message<BitcoinChainType> {
  public static type() {
    return "request-bitcoin-switch-chain";
  }

  constructor(public readonly chainType: BitcoinChainType) {
    super();
  }

  validateBasic(): void {
    if (!this.chainType) {
      throw new Error("chainType is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBitcoinSwitchChainMsg.type();
  }
}

export class RequestBitcoinGetPublicKeyMsg extends Message<string> {
  public static type() {
    return "request-bitcoin-get-public-key";
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
    return RequestBitcoinGetPublicKeyMsg.type();
  }
}

export class RequestBitcoinGetBalanceMsg extends Message<{
  confirmed: number;
  unconfirmed: number;
  total: number;
}> {
  public static type() {
    return "request-bitcoin-get-balance";
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
    return RequestBitcoinGetBalanceMsg.type();
  }
}

export class RequestBitcoinGetInscriptionsMsg extends Message<void> {
  public static type() {
    return "request-bitcoin-get-inscriptions";
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
    return RequestBitcoinGetInscriptionsMsg.type();
  }
}

export class RequestBitcoinSendBitcoinMsg extends Message<string> {
  public static type() {
    return "request-bitcoin-send-bitcoin";
  }

  constructor(public readonly to: string, public readonly amount: number) {
    super();
  }

  validateBasic(): void {
    if (!this.to) {
      throw new Error("to is not set");
    }
    if (!this.amount) {
      throw new Error("amount is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBitcoinSendBitcoinMsg.type();
  }
}

export class RequestBitcoinPushTxMsg extends Message<string> {
  public static type() {
    return "request-bitcoin-push-tx";
  }

  constructor(public readonly rawTxHex: string) {
    super();
  }

  validateBasic(): void {
    if (!this.rawTxHex) {
      throw new Error("rawTxHex is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBitcoinPushTxMsg.type();
  }
}

export class RequestBitcoinPushPsbtMsg extends Message<string> {
  public static type() {
    return "request-bitcoin-push-psbt";
  }

  constructor(public readonly psbtHex: string) {
    super();
  }

  validateBasic(): void {
    if (!this.psbtHex) {
      throw new Error("psbtHex is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBitcoinPushPsbtMsg.type();
  }
}

export class GetPreferredBitcoinPaymentTypeMsg extends Message<SupportedPaymentType> {
  public static type() {
    return "get-preferred-bitcoin-payment-type";
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
    return GetPreferredBitcoinPaymentTypeMsg.type();
  }
}

export class SetPreferredBitcoinPaymentTypeMsg extends Message<void> {
  public static type() {
    return "set-preferred-bitcoin-payment-type";
  }

  constructor(public readonly paymentType: SupportedPaymentType) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetPreferredBitcoinPaymentTypeMsg.type();
  }
}
