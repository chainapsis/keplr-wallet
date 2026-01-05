import { Message } from "@keplr-wallet/router";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");
import { ROUTE } from "./constants";
import {
  KeyRingStatus,
  BIP44HDPath,
  KeyInfo,
  ExportedKeyRingVault,
  ExtendedKey,
} from "./types";
import { PlainObject } from "../vault";
import * as Legacy from "./legacy";
import { MultiAccounts } from "../keyring-keystone";

export class GetIsLockedMsg extends Message<boolean> {
  public static type() {
    return "GetIsLockedMsg";
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
    return GetIsLockedMsg.type();
  }
}

export class GetKeyRingStatusMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
  needMigration: boolean;
  isMigrating: boolean;
}> {
  public static type() {
    return "get-keyring-status";
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
    return GetKeyRingStatusMsg.type();
  }
}

export class GetKeyRingStatusOnlyMsg extends Message<{
  status: KeyRingStatus;
}> {
  public static type() {
    return "get-keyring-status-only";
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
    return GetKeyRingStatusOnlyMsg.type();
  }
}

export class SelectKeyRingMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "select-keyring";
  }

  constructor(public readonly vaultId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("Vault id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SelectKeyRingMsg.type();
  }
}

export class FinalizeKeyCoinTypeMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "finalize-key-coin-type";
  }

  constructor(
    public readonly id: string,
    public readonly chainId: string,
    public readonly coinType: number
  ) {
    super();
  }

  validateBasic() {
    if (!this.id) {
      throw new Error("id not set");
    }

    if (!this.chainId) {
      throw new Error("chainId not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return FinalizeKeyCoinTypeMsg.type();
  }
}

export class NewMnemonicKeyMsg extends Message<{
  vaultId: string;
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "new-mnemonic-key";
  }

  constructor(
    public readonly mnemonic: string,
    public readonly bip44HDPath: BIP44HDPath,
    public readonly name: string,
    public readonly password?: string,
    public readonly meta?: PlainObject
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.mnemonic) {
      throw new Error("mnemonic not set");
    }

    if (!this.name) {
      throw new Error("name not set");
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
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return NewMnemonicKeyMsg.type();
  }
}

export class NewLedgerKeyMsg extends Message<{
  vaultId: string;
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "new-ledger-key";
  }

  constructor(
    public readonly pubKey: Uint8Array,
    public readonly app: string,
    public readonly bip44HDPath: BIP44HDPath,
    public readonly name: string,
    public readonly password?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.pubKey || this.pubKey.length === 0) {
      throw new Error("pub key not set");
    }

    if (!this.app) {
      throw new Error("app not set");
    }

    if (!this.name) {
      throw new Error("name not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return NewLedgerKeyMsg.type();
  }
}

export class NewKeystoneKeyMsg extends Message<{
  vaultId: string;
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "new-keystone-key";
  }

  constructor(
    public readonly multiAccounts: MultiAccounts,
    public readonly name: string,
    public readonly password?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.multiAccounts || this.multiAccounts.keys.length === 0) {
      throw new Error("pub key not set");
    }

    if (!this.multiAccounts.masterFingerprint) {
      throw new Error("masterFingerprint not set");
    }

    if (!this.name) {
      throw new Error("name not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return NewKeystoneKeyMsg.type();
  }
}

export class NewPrivateKeyKeyMsg extends Message<{
  vaultId: string;
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "new-private-key-key";
  }

  constructor(
    public readonly privateKey: Uint8Array,
    public readonly meta: PlainObject,
    public readonly name: string,
    public readonly password?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.privateKey || this.privateKey.length === 0) {
      throw new Error("priv key not set");
    }

    if (!this.meta) {
      throw new Error("meta not set");
    }

    if (!this.name) {
      throw new Error("name not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return NewPrivateKeyKeyMsg.type();
  }
}

export class AppendLedgerKeyAppMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "append-ledger-key-app";
  }

  constructor(
    public readonly vaultId: string,
    public readonly pubKey: Uint8Array,
    public readonly app: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.pubKey || this.pubKey.length === 0) {
      throw new Error("pub key not set");
    }

    if (!this.app) {
      throw new Error("app not set");
    }

    if (!this.vaultId) {
      throw new Error("vault id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AppendLedgerKeyAppMsg.type();
  }
}

export class AppendLedgerExtendedKeysMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "append-ledger-key-with-derivation";
  }

  constructor(
    public readonly vaultId: string,
    public readonly extendedKeys: ExtendedKey[],
    public readonly app: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vault id not set");
    }

    if (!this.extendedKeys || this.extendedKeys.length === 0) {
      throw new Error("extended keys not set");
    }

    if (!this.app) {
      throw new Error("app not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AppendLedgerExtendedKeysMsg.type();
  }
}

export class LockKeyRingMsg extends Message<{
  status: KeyRingStatus;
}> {
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

export class UnlockKeyRingMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "unlock-keyring";
  }

  constructor(public readonly password: string) {
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

export class ChangeKeyRingNameMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "change-keyring-name";
  }

  constructor(public readonly vaultId: string, public readonly name: string) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vaultId not set");
    }

    if (!this.name) {
      throw new Error("name not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ChangeKeyRingNameMsg.type();
  }
}

export class ChangeKeyRingNameInteractiveMsg extends Message<string> {
  public static type() {
    return "change-keyring-name-interactive";
  }

  constructor(
    public readonly defaultName: string,
    public readonly editable: boolean
  ) {
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
    return ChangeKeyRingNameInteractiveMsg.type();
  }
}

export class DeleteKeyRingMsg extends Message<{
  wasSelected: boolean;
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
}> {
  public static type() {
    return "v2/delete-keyring";
  }

  constructor(
    public readonly vaultId: string,
    public readonly password: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vaultId not set");
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

export class ShowSensitiveKeyRingDataMsg extends Message<string> {
  public static type() {
    return "show-sensitive-keyring-data";
  }

  constructor(
    public readonly vaultId: string,
    public readonly password: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.vaultId) {
      throw new Error("vaultId not set");
    }

    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ShowSensitiveKeyRingDataMsg.type();
  }
}

export class ChangeUserPasswordMsg extends Message<void> {
  public static type() {
    return "ChangeUserPasswordMsg";
  }

  constructor(
    public readonly prevUserPassword: string,
    public readonly newUserPassword: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.prevUserPassword) {
      throw new Error("prevUserPassword not set");
    }

    if (!this.newUserPassword) {
      throw new Error("newUserPassword not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ChangeUserPasswordMsg.type();
  }
}

export class ExportKeyRingVaultsMsg extends Message<ExportedKeyRingVault[]> {
  public static type() {
    return "export-keyring-vaults";
  }

  constructor(public readonly password: string) {
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
    return ExportKeyRingVaultsMsg.type();
  }
}

export class ExportKeyRingDataMsg extends Message<Legacy.ExportKeyRingData[]> {
  public static type() {
    return "export-keyring-data";
  }

  constructor(public readonly password: string) {
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
    return ExportKeyRingDataMsg.type();
  }
}

export class CheckLegacyKeyRingPasswordMsg extends Message<void> {
  public static type() {
    return "CheckLegacyKeyRingPassword";
  }

  constructor(public readonly password: string) {
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
    return CheckLegacyKeyRingPasswordMsg.type();
  }
}

export class GetLegacyKeyRingInfosMsg extends Message<
  Legacy.KeyStore[] | undefined
> {
  public static type() {
    return "GetLegacyKeyRingInfos";
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
    return GetLegacyKeyRingInfosMsg.type();
  }
}

export class ShowSensitiveLegacyKeyRingDataMsg extends Message<string> {
  public static type() {
    return "ShowSensitiveLegacyKeyRingData";
  }

  constructor(public readonly index: string, public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!this.index) {
      throw new Error("index not set");
    }

    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ShowSensitiveLegacyKeyRingDataMsg.type();
  }
}

export class CheckPasswordMsg extends Message<boolean> {
  public static type() {
    return "check-keyring-password";
  }

  constructor(public readonly password: string) {
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
    return CheckPasswordMsg.type();
  }
}

export class SearchKeyRingsMsg extends Message<KeyInfo[]> {
  public static type() {
    return "search-keyrings";
  }

  constructor(public readonly searchText: string) {
    super();
  }

  validateBasic(): void {
    if (this.searchText == null) {
      throw new Error("searchText not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SearchKeyRingsMsg.type();
  }
}

export class ClearAllKeyRingsMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "clear-all-keyrings";
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
    return ClearAllKeyRingsMsg.type();
  }
}
