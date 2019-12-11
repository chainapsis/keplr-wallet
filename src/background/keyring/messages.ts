import { Message } from "../../common/message";
import { ROUTE } from "./constants";
import { ChainInfo } from "../../chain-info";
import { KeyRingStatus } from "./keyring";
import { KeyHex } from "./keeper";
import {
  TxBuilderConfigPrimitive,
  TxBuilderConfigPrimitiveWithChainId
} from "./types";
import { AsyncApprover } from "../../common/async-approver";

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

export class ClearKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "clear-keyring";
  }

  public static create(): ClearKeyRingMsg {
    return new ClearKeyRingMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ClearKeyRingMsg.type();
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
  public origin: string = "";

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

    if (!this.origin) {
      throw new Error("origin is empty");
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

export class RequestTxBuilderConfigMsg extends Message<{
  config: TxBuilderConfigPrimitive;
}> {
  public static type() {
    return "request-tx-builder-config";
  }

  public static create(
    config: TxBuilderConfigPrimitiveWithChainId,
    openPopup: boolean,
    origin: string
  ): RequestTxBuilderConfigMsg {
    const msg = new RequestTxBuilderConfigMsg();
    msg.config = config;
    msg.openPopup = openPopup;
    msg.origin = origin;
    return msg;
  }

  public config?: TxBuilderConfigPrimitiveWithChainId;
  public openPopup: boolean = false;
  public origin: string = "";

  validateBasic(): void {
    if (!this.config) {
      throw new Error("config is null");
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

    if (!this.origin) {
      throw new Error("origin is empty");
    }

    const url = new URL(sender.url);
    return url.origin === this.origin;
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

  public static create(chainId: string): GetRequestedTxBuilderConfigMsg {
    const msg = new GetRequestedTxBuilderConfigMsg();
    msg.chainId = chainId;
    return msg;
  }

  public chainId: string = "";

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }
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

  public static create(
    config: TxBuilderConfigPrimitiveWithChainId
  ): ApproveTxBuilderConfigMsg {
    const msg = new ApproveTxBuilderConfigMsg();
    msg.config = config;
    return msg;
  }

  public config?: TxBuilderConfigPrimitiveWithChainId;

  validateBasic(): void {
    if (!this.config) {
      throw new Error("config is empty");
    }
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

  public static create(chainId: string): RejectTxBuilderConfigMsg {
    const msg = new RejectTxBuilderConfigMsg();
    msg.chainId = chainId;
    return msg;
  }

  public chainId: string = "";

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }
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

    AsyncApprover.isValidIndex(this.index);
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

    if (!this.origin) {
      throw new Error("origin is empty");
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

    AsyncApprover.isValidIndex(this.index);
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
    AsyncApprover.isValidIndex(this.index);
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
    AsyncApprover.isValidIndex(this.index);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSignMsg.type();
  }
}
