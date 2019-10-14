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

export class RequestSignMsg extends Message {
  public static type() {
    return "request-sign";
  }

  public static create(
    index: string,
    messageHex: string,
    internal: boolean = false
  ): RequestSignMsg {
    const msg = new RequestSignMsg();
    msg.index = index;
    msg.messageHex = messageHex;
    msg.internal = internal;
    return msg;
  }

  public index: string = "";
  // Hex encoded message.
  public messageHex: string = "";
  public internal: boolean = false;

  validateBasic(): void {
    if (!this.messageHex) {
      throw new Error("message is empty");
    }

    if (!this.index) {
      throw new Error("index is empty");
    }
    if (this.index.length < 4) {
      throw new Error("index is too short");
    }
    if (this.index.length > 8) {
      throw new Error("index is too long");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignMsg.type();
  }

  approveExternal(sender: chrome.runtime.MessageSender): boolean {
    if (this.internal) {
      return super.approveExternal(sender);
    } else {
      // TODO
    }
    return false;
  }
}

export class GetRequestedMessage extends Message {
  public static type() {
    return "get-request-message";
  }

  public static create(index: string): GetRequestedMessage {
    const msg = new GetRequestedMessage();
    msg.index = index;
    return msg;
  }

  public index: string = "";

  validateBasic(): void {
    if (!this.index) {
      throw new Error("index is empty");
    }
    if (this.index.length < 4) {
      throw new Error("index is too short");
    }
    if (this.index.length > 8) {
      throw new Error("index is too long");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRequestedMessage.type();
  }
}
export class ApproveSignMsg extends Message {
  public static type() {
    return "approve-sign";
  }

  public static create(index: string): ApproveSignMsg {
    const msg = new ApproveSignMsg();
    msg.index = index;
    return msg;
  }

  public index: string = "";

  validateBasic(): void {
    if (!this.index) {
      throw new Error("index is empty");
    }
    if (this.index.length < 4) {
      throw new Error("index is too short");
    }
    if (this.index.length > 8) {
      throw new Error("index is too long");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveSignMsg.type();
  }
}

export class RejectSignMsg extends Message {
  public static type() {
    return "reject-sign";
  }

  public static create(index: string): RejectSignMsg {
    const msg = new RejectSignMsg();
    msg.index = index;
    return msg;
  }

  public index: string = "";

  validateBasic(): void {
    if (!this.index) {
      throw new Error("index is empty");
    }
    if (this.index.length < 4) {
      throw new Error("index is too short");
    }
    if (this.index.length > 8) {
      throw new Error("index is too long");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSignMsg.type();
  }
}
