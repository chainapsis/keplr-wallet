import { Message } from "../../common/message";
import { ROUTE } from "./constants";

export class RestoreKeyRingMsg extends Message {
  public static type() {
    return "restore-keyring";
  }

  public static create(): RestoreKeyRingMsg {
    return new RestoreKeyRingMsg();
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

export class SaveKeyRingMsg extends Message {
  public static type() {
    return "save-keyring";
  }

  public static create(): SaveKeyRingMsg {
    return new SaveKeyRingMsg();
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

export class CreateKeyMsg extends Message {
  public static type() {
    return "create-key";
  }

  public static create(mnemonic: string, password: string): CreateKeyMsg {
    const msg = new CreateKeyMsg();
    msg.mnemonic = mnemonic;
    msg.password = password;
    return msg;
  }

  public mnemonic = "";
  public password = "";

  validateBasic(): void {
    if (!this.mnemonic) {
      throw new Error("mnemonic not set");
    }

    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateKeyMsg.type();
  }
}

export class UnlockKeyRingMsg extends Message {
  public static type() {
    return "unlock-keyring";
  }

  public static create(password: string): UnlockKeyRingMsg {
    const msg = new UnlockKeyRingMsg();
    msg.password = password;
    return msg;
  }

  public password = "";

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

export class SetPathMsg extends Message {
  public static type() {
    return "set-path";
  }

  public static create(path: string): SetPathMsg {
    const msg = new SetPathMsg();
    msg.path = path;
    return msg;
  }

  public path = "";

  validateBasic(): void {
    if (!this.path) {
      throw new Error("path not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetPathMsg.type();
  }
}

export class GetKeyMsg extends Message {
  public static type() {
    return "get-key";
  }

  public static create(prefix: string): GetKeyMsg {
    const msg = new GetKeyMsg();
    msg.prefix = prefix;
    return msg;
  }

  public prefix = "";

  validateBasic(): void {
    if (!this.prefix) {
      throw new Error("prefix not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyMsg.type();
  }
}
