import { Message } from "@keplr-wallet/router";
import { UmbralEncryptionResult, UmbralKeyFragment } from "./types";

export const ROUTE = "umbral";

export class UmbralGetPublicKeyMsg extends Message<Uint8Array> {
  public static type() {
    return "get-public-key-msg";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UmbralGetPublicKeyMsg.type();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }
}

export class UmbralGetSigningPublicKeyMsg extends Message<Uint8Array> {
  public static type() {
    return "get-signing-public-key-msg";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UmbralGetSigningPublicKeyMsg.type();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }
}

export class UmbralEncryptMsg extends Message<UmbralEncryptionResult> {
  public static type() {
    return "encrypt";
  }

  constructor(
    public readonly pubKey: Uint8Array,
    public readonly plainTextBytes: Uint8Array
  ) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UmbralEncryptMsg.type();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.pubKey) {
      throw new Error("pubKey not set");
    }
    if (!this.plainTextBytes) {
      throw new Error("plainTextBytes not set");
    }
  }
}

export class UmbralGenerateKeyFragsMsg extends Message<{
  fragments: UmbralKeyFragment[];
}> {
  public static type() {
    return "generate-kfrags";
  }

  constructor(
    public readonly chainId: string,
    public readonly receiverPublicKey: Uint8Array,
    public readonly threshold: number,
    public readonly shares: number
  ) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UmbralGenerateKeyFragsMsg.type();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
    if (!this.receiverPublicKey) {
      throw new Error("receiverPublicKey not set");
    }
    if (!this.threshold) {
      throw new Error("threshold not set");
    }
    if (!this.shares) {
      throw new Error("shares not set");
    }
  }
}

export class UmbralDecryptMsg extends Message<Uint8Array> {
  public static type() {
    return "decrypt";
  }

  constructor(
    public readonly chainId: string,
    public readonly capsuleBytes: Uint8Array,
    public readonly cipherTextBytes: Uint8Array
  ) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UmbralDecryptMsg.type();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
    if (!this.cipherTextBytes) {
      throw new Error("cipherTextBytes not set");
    }
  }
}

export class UmbralDecryptReEncryptedMsg extends Message<Uint8Array> {
  public static type() {
    return "decrypt-re-encrypted";
  }

  constructor(
    public readonly chainId: string,
    public readonly senderPublicKey: Uint8Array,
    public readonly capsule: Uint8Array,
    public readonly capsuleFragments: Uint8Array[],
    public readonly cipherTextBytes: Uint8Array
  ) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UmbralDecryptReEncryptedMsg.type();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
    if (!this.cipherTextBytes) {
      throw new Error("cipherTextBytes not set");
    }
  }
}

export class UmbralVerifyCapsuleFragMsg extends Message<boolean> {
  public static type() {
    return "verify-capsule-fragment";
  }

  constructor(
    public readonly capsuleFragment: Uint8Array,
    public readonly capsule: Uint8Array,
    public readonly verifyingPublicKey: Uint8Array,
    public readonly senderPublicKey: Uint8Array,
    public readonly receiverPublicKey: Uint8Array
  ) {
    super();
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UmbralDecryptReEncryptedMsg.type();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.capsuleFragment) {
      throw new Error("capsuleFragment not set");
    }
    if (!this.capsule) {
      throw new Error("capsule not set");
    }
    if (!this.verifyingPublicKey) {
      throw new Error("verifyingPublicKey not set");
    }
    if (!this.senderPublicKey) {
      throw new Error("senderPublicKey not set");
    }
    if (!this.receiverPublicKey) {
      throw new Error("receiverPublicKey not set");
    }
  }
}
