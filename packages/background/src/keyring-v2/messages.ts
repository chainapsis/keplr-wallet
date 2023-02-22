import { Message } from "@keplr-wallet/router";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");
import { ROUTE } from "./constants";
import { KeyRingStatus, BIP44HDPath, KeyInfo } from "./types";

export class GetKeyRingStatusMsg extends Message<{
  status: KeyRingStatus;
  keyInfos: KeyInfo[];
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

export class NewMnemonicKeyMsg extends Message<{
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
    public readonly password?: string
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
