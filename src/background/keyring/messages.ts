import { Message } from "../../common/message";
import { ROUTE } from "./constants";
import {
  KeyRing,
  KeyRingStatus,
  MultiKeyStoreInfoWithSelected
} from "./keyring";
import { KeyHex } from "./keeper";
import {
  BIP44HDPath,
  TxBuilderConfigPrimitive,
  TxBuilderConfigPrimitiveWithChainId
} from "./types";
import { AsyncApprover } from "../../common/async-approver";

import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");
const Buffer = require("buffer/").Buffer;

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

export class RestoreKeyRingMsg extends Message<{ status: KeyRingStatus }> {
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

export class SaveKeyRingMsg extends Message<{ success: boolean }> {
  public static type() {
    return "save-keyring";
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
    return SaveKeyRingMsg.type();
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
    if (parseInt(this.index.toString()) !== this.index) {
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
    if (parseInt(this.index.toString()) !== this.index) {
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

export class RequestTxBuilderConfigMsg extends Message<{
  config: TxBuilderConfigPrimitive;
}> {
  public static type() {
    return "request-tx-builder-config";
  }

  constructor(
    public readonly config: TxBuilderConfigPrimitiveWithChainId,
    public readonly id: string,
    public readonly openPopup: boolean,
    public readonly skipApprove: boolean = false
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.config) {
      throw new Error("config is null");
    }

    AsyncApprover.isValidId(this.id);
  }

  approveExternal(): boolean {
    // Skipping approving is allowed only in internal request.
    return !this.skipApprove;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestTxBuilderConfigMsg.type();
  }
}

export class GetRequestedTxBuilderConfigMsg extends Message<{
  config: TxBuilderConfigPrimitiveWithChainId;
}> {
  public static type() {
    return "get-requested-tx-builder-config";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRequestedTxBuilderConfigMsg.type();
  }
}

export class ApproveTxBuilderConfigMsg extends Message<{}> {
  public static type() {
    return "approve-tx-builder-config";
  }

  constructor(
    public readonly id: string,
    public readonly config: TxBuilderConfigPrimitive
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.config) {
      throw new Error("config is empty");
    }

    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveTxBuilderConfigMsg.type();
  }
}

export class RejectTxBuilderConfigMsg extends Message<{}> {
  public static type() {
    return "reject-tx-builder-config";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectTxBuilderConfigMsg.type();
  }
}

export class RequestSignMsg extends Message<{ signatureHex: string }> {
  public static type() {
    return "request-sign";
  }

  constructor(
    public readonly chainId: string,
    public readonly id: string,
    public readonly bech32Address: string,
    // Hex encoded message.
    public readonly messageHex: string,
    public readonly openPopup: boolean,
    public readonly skipApprove: boolean = false
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

    if (!this.messageHex) {
      throw new Error("message is empty");
    }

    // Validate bech32 address.
    AccAddress.fromBech32(this.bech32Address);

    // Check that message is encoded as hex.
    const buffer = Buffer.from(this.messageHex, "hex");

    // Message should be json.
    const message = JSON.parse(buffer.toString());
    if (message["chain_id"] !== this.chainId) {
      throw new Error(
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    AsyncApprover.isValidId(this.id);
  }

  approveExternal(): boolean {
    // Skipping approving is allowed only in internal request.
    return !this.skipApprove;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignMsg.type();
  }
}

export class GetRequestedMessage extends Message<{
  chainId: string;
  messageHex: string;
}> {
  public static type() {
    return "get-request-message";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new Error("id is empty");
    }

    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRequestedMessage.type();
  }
}
export class ApproveSignMsg extends Message<void> {
  public static type() {
    return "approve-sign";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveSignMsg.type();
  }
}

export class RejectSignMsg extends Message<void> {
  public static type() {
    return "reject-sign";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSignMsg.type();
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

export class GetMultiKeyStoreInfoMsg extends Message<
  MultiKeyStoreInfoWithSelected
> {
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

    if (parseInt(this.index.toString()) !== this.index) {
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

export class GetKeyStoreBIP44SelectablesMsg extends Message<
  {
    readonly path: BIP44;
    readonly bech32Address: string;
    readonly isExistent: boolean;
  }[]
> {
  public static type() {
    return "get-keystore-bip44-selectables";
  }

  constructor(public readonly chainId: string, public readonly paths: BIP44[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyStoreBIP44SelectablesMsg.type();
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
