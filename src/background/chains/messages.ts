import { Message, MessageSender } from "../../common/message";
import { AccessOrigin, ChainInfo } from "./types";
import { ROUTE } from "./constants";
import { AsyncApprover } from "../../common/async-approver";

export class GetChainInfosMsg extends Message<{
  chainInfos: ChainInfo[];
}> {
  public static type() {
    return "get-chain-infos";
  }

  public static create(): GetChainInfosMsg {
    return new GetChainInfosMsg();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainInfosMsg.type();
  }
}

export class ReqeustAccessMsg extends Message<void> {
  public static type() {
    return "request-access";
  }

  public static create(
    id: string,
    chainId: string,
    origin: string
  ): ReqeustAccessMsg {
    const msg = new ReqeustAccessMsg();
    msg.id = id;
    msg.chainId = chainId;
    msg.origin = origin;
    return msg;
  }

  public id: string = "";
  public chainId: string = "";
  public origin: string = "";

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    AsyncApprover.isValidId(this.id);
  }

  // Approve external approves sending message if they submit their origin correctly.
  // Keeper or handler must check that this origin has right permission.
  approveExternal(sender: MessageSender): boolean {
    const isInternal = super.approveExternal(sender);
    if (isInternal) {
      return true;
    }

    return Message.checkOriginIsValid(this.origin, sender);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ReqeustAccessMsg.type();
  }
}

export class GetReqeustAccessDataMsg extends Message<AccessOrigin> {
  public static type() {
    return "get-request-access-data";
  }

  public static create(id: string): GetReqeustAccessDataMsg {
    const msg = new GetReqeustAccessDataMsg();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetReqeustAccessDataMsg.type();
  }
}

export class ApproveAccessMsg extends Message<void> {
  public static type() {
    return "approve-access";
  }

  public static create(id: string): ApproveAccessMsg {
    const msg = new ApproveAccessMsg();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveAccessMsg.type();
  }
}

export class RejectAccessMsg extends Message<void> {
  public static type() {
    return "reject-access";
  }

  public static create(id: string): RejectAccessMsg {
    const msg = new RejectAccessMsg();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectAccessMsg.type();
  }
}

export class GetAccessOriginMsg extends Message<AccessOrigin> {
  public static type() {
    return "get-access-origin";
  }

  public static create(chainId: string): GetAccessOriginMsg {
    const msg = new GetAccessOriginMsg();
    msg.chainId = chainId;
    return msg;
  }

  public chainId: string = "";

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Empty chain id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetAccessOriginMsg.type();
  }
}

export class RemoveAccessOriginMsg extends Message<void> {
  public static type() {
    return "remove-access-origin";
  }

  public static create(chainId: string, origin: string): RemoveAccessOriginMsg {
    const msg = new RemoveAccessOriginMsg();
    msg.chainId = chainId;
    msg.origin = origin;
    return msg;
  }

  public chainId: string = "";
  public origin: string = "";

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Empty chain id");
    }

    if (!this.origin) {
      throw new Error("Empty origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveAccessOriginMsg.type();
  }
}
