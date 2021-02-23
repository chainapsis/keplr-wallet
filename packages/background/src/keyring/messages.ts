import { Message } from "@keplr/router";
import { ROUTE } from "./constants";
import {
  KeyRing,
  KeyRingStatus,
  MultiKeyStoreInfoWithSelected,
} from "./keyring";
import { BIP44HDPath } from "./types";

import { Bech32Address } from "@keplr/cosmos";
import { BIP44, KeyHex } from "@keplr/types";

import { StdSignDoc, AminoSignResponse } from "@cosmjs/launchpad";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");
import { Buffer } from "buffer/";

export class RestoreKeyRingMsg extends Message<{
  status: KeyRingStatus;
  type: string;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "restore-keyring";
  }

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RestoreKeyRingMsg.type();
  }
}

export class EnableKeyRingMsg extends Message<{
  status: KeyRingStatus;
}> {
  public static type() {
    return "enable-keyring";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return EnableKeyRingMsg.type();
  }
}

export class DeleteKeyRingMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "delete-keyring";
  }

  constructor(public readonly index: number, public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new Error("Invalid index");
    }

    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeleteKeyRingMsg.type();
  }
}

export class ShowKeyRingMsg extends Message<string> {
  public static type() {
    return "show-keyring";
  }

  constructor(public readonly index: number, public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new Error("Invalid index");
    }

    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ShowKeyRingMsg.type();
  }
}

export class CreateMnemonicKeyMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "create-mnemonic-key";
  }

  constructor(
    public readonly mnemonic: string,
    public readonly password: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.mnemonic) {
      throw new Error("mnemonic not set");
    }

    if (!this.password) {
      throw new Error("password not set");
    }

    // Validate mnemonic.
    // Checksome is not validate in this method.
    // Keeper should handle the case of invalid checksome.
    try {
      bip39.mnemonicToEntropy(this.mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateMnemonicKeyMsg.type();
  }
}

export class AddMnemonicKeyMsg extends Message<MultiKeyStoreInfoWithSelected> {
  public static type() {
    return "add-mnemonic-key";
  }

  constructor(
    public readonly mnemonic: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.mnemonic) {
      throw new Error("mnemonic not set");
    }

    // Validate mnemonic.
    // Checksome is not validate in this method.
    // Keeper should handle the case of invalid checksome.
    try {
      bip39.mnemonicToEntropy(this.mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddMnemonicKeyMsg.type();
  }
}

export class CreatePrivateKeyMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "create-private-key";
  }

  constructor(
    // Hex encoded bytes.
    public readonly privateKeyHex: string,
    public readonly password: string,
    public readonly meta: Record<string, string>
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.privateKeyHex) {
      throw new Error("private key not set");
    }

    if (!this.password) {
      throw new Error("password not set");
    }

    // Check that private key is encoded as hex.
    Buffer.from(this.privateKeyHex, "hex");
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreatePrivateKeyMsg.type();
  }
}

export class CreateLedgerKeyMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "create-ledger-key";
  }

  constructor(
    public readonly password: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new Error("password not set");
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateLedgerKeyMsg.type();
  }
}

export class AddPrivateKeyMsg extends Message<MultiKeyStoreInfoWithSelected> {
  public static type() {
    return "add-private-key";
  }

  constructor(
    // Hex encoded bytes.
    public readonly privateKeyHex: string,
    public readonly meta: Record<string, string>
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.privateKeyHex) {
      throw new Error("private key not set");
    }

    // Check that private key is encoded as hex.
    Buffer.from(this.privateKeyHex, "hex");
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddPrivateKeyMsg.type();
  }
}

export class AddLedgerKeyMsg extends Message<MultiKeyStoreInfoWithSelected> {
  public static type() {
    return "add-ledger-key";
  }

  constructor(
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddLedgerKeyMsg.type();
  }
}

export class LockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "lock-keyring";
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
    return LockKeyRingMsg.type();
  }
}

export class UnlockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "unlock-keyring";
  }

  constructor(public readonly password = "") {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UnlockKeyRingMsg.type();
  }
}

export class GetKeyMsg extends Message<KeyHex> {
  public static type() {
    return "get-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyMsg.type();
  }
}

export class RequestSignMsg extends Message<AminoSignResponse> {
  public static type() {
    return "request-sign";
  }

  constructor(
    public readonly chainId: string,
    public readonly bech32Address: string,
    public readonly signDoc: StdSignDoc
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.bech32Address) {
      throw new Error("bech32 address not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.bech32Address);

    if (this.signDoc.chain_id !== this.chainId) {
      throw new Error(
        "Chain id in the message is not matched with the requested chain id"
      );
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignMsg.type();
  }
}

export class GetKeyRingTypeMsg extends Message<string> {
  public static type() {
    return "get-keyring-type";
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
    return GetKeyRingTypeMsg.type();
  }
}

export class GetMultiKeyStoreInfoMsg extends Message<MultiKeyStoreInfoWithSelected> {
  public static type() {
    return "get-multi-key-store-info";
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
    return GetMultiKeyStoreInfoMsg.type();
  }
}

export class ChangeKeyRingMsg extends Message<MultiKeyStoreInfoWithSelected> {
  public static type() {
    return "change-keyring";
  }

  constructor(public readonly index: number) {
    super();
  }

  validateBasic(): void {
    if (this.index < 0) {
      throw new Error("Index is negative");
    }

    if (!Number.isInteger(this.index)) {
      throw new Error("Invalid index");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ChangeKeyRingMsg.type();
  }
}

// Return the list of selectable path.
// If coin type was set for the key store, will return empty array.
export class GetIsKeyStoreCoinTypeSetMsg extends Message<
  {
    readonly path: BIP44;
    readonly bech32Address: string;
  }[]
> {
  public static type() {
    return "get-is-keystore-coin-type-set";
  }

  constructor(public readonly chainId: string, public readonly paths: BIP44[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (this.paths.length === 0) {
      throw new Error("empty bip44 path list");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetIsKeyStoreCoinTypeSetMsg.type();
  }
}

export class SetKeyStoreCoinTypeMsg extends Message<KeyRingStatus> {
  public static type() {
    return "set-keystore-coin-type";
  }

  constructor(
    public readonly chainId: string,
    public readonly coinType: number
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (this.coinType < 0) {
      throw new Error("coin type can not be negative");
    }

    if (!Number.isInteger(this.coinType)) {
      throw new Error("coin type should be integer");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetKeyStoreCoinTypeMsg.type();
  }
}
