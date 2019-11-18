import { Message } from "../../common/message";
import { ROUTE } from "./constants";
import { ChainInfo } from "../../chain-info";
import { KeyRingStatus } from "./keyring";
import { KeyHex } from "./keeper";

export class GetRegisteredChainMsg extends Message<{
  // Need to set prototype for elements of array manually.
  chainInfos: ChainInfo[];
}> {
  public static type() {
    return "get-registered-chain-infos";
  }

  public static create(): GetRegisteredChainMsg {
    return new GetRegisteredChainMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRegisteredChainMsg.type();
  }
}

export class RestoreKeyRingMsg extends Message<{ status: KeyRingStatus }> {
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

export class SaveKeyRingMsg extends Message<{ success: boolean }> {
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

export class CreateKeyMsg extends Message<{ status: KeyRingStatus }> {
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

export class LockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "lock-keyring";
  }

  public static create(): LockKeyRingMsg {
    return new LockKeyRingMsg();
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

export class SetPathMsg extends Message<{ success: boolean }> {
  public static type() {
    return "set-path";
  }

  public static create(
    chainId: string,
    account: number,
    index: number
  ): SetPathMsg {
    const msg = new SetPathMsg();
    msg.chainId = chainId;
    msg.account = account;
    msg.index = index;
    return msg;
  }

  public chainId: string = "";
  public account: number = -1;
  public index: number = -1;

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (this.account < 0) {
      throw new Error("Invalid account");
    }

    if (this.index < 0) {
      throw new Error("Invalid index");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetPathMsg.type();
  }
}

export class GetKeyMsg extends Message<KeyHex> {
  public static type() {
    return "get-key";
  }

  public static create(chainId: string, origin: string): GetKeyMsg {
    const msg = new GetKeyMsg();
    msg.chainId = chainId;
    msg.origin = origin;
    return msg;
  }

  public chainId = "";
  public origin: string | undefined;

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  // Approve external approves sending message if they submit their origin correctly.
  // Keeper or handler must check that this origin has right permission.
  approveExternal(sender: chrome.runtime.MessageSender): boolean {
    const isInternal = super.approveExternal(sender);
    if (isInternal) {
      return true;
    }

    // TODO: When is a url undefined?
    if (!sender.url) {
      throw new Error("url is empty");
    }

    const url = new URL(sender.url);
    return url.origin === this.origin;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyMsg.type();
  }
}

export class RequestSignMsg extends Message<{ signatureHex: string }> {
  public static type() {
    return "request-sign";
  }

  public static create(
    chainId: string,
    index: string,
    bech32Address: string,
    messageHex: string,
    openPopup: boolean,
    origin: string
  ): RequestSignMsg {
    const msg = new RequestSignMsg();
    msg.chainId = chainId;
    msg.index = index;
    msg.bech32Address = bech32Address;
    msg.messageHex = messageHex;
    msg.openPopup = openPopup;
    msg.origin = origin;
    return msg;
  }

  public chainId: string = "";
  public index: string = "";
  public bech32Address: string = "";
  // Hex encoded message.
  public messageHex: string = "";
  public openPopup: boolean = false;
  public origin: string = "";

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

  // Approve external approves sending message if they submit their origin correctly.
  // Keeper or handler must check that this origin has right permission.
  approveExternal(sender: chrome.runtime.MessageSender): boolean {
    const isInternal = super.approveExternal(sender);
    if (isInternal) {
      return true;
    }

    // TODO: When is a url undefined?
    if (!sender.url) {
      throw new Error("url is empty");
    }

    const url = new URL(sender.url);
    return url.origin === this.origin;
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
export class ApproveSignMsg extends Message<void> {
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

export class RejectSignMsg extends Message<void> {
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
