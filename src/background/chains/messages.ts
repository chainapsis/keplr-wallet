import { Message } from "../../common/message";
import { AccessOrigin, ChainInfo } from "./types";
import { ROUTE } from "./constants";
import { AsyncApprover } from "../../common/async-approver";

export class GetChainInfosMsg extends Message<{
  chainInfos: ChainInfo[];
}> {
  public static type() {
    return "get-chain-infos";
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

  constructor(
    public readonly id: string,
    public readonly chainId: string,
    public readonly appOrigin: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.appOrigin) {
      throw new Error("Empty origin");
    }

    AsyncApprover.isValidId(this.id);
  }

  approveExternal(): boolean {
    return true;
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
    return GetReqeustAccessDataMsg.type();
  }
}

export class ApproveAccessMsg extends Message<void> {
  public static type() {
    return "approve-access";
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
    return ApproveAccessMsg.type();
  }
}

export class RejectAccessMsg extends Message<void> {
  public static type() {
    return "reject-access";
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
    return RejectAccessMsg.type();
  }
}

export class GetAccessOriginMsg extends Message<AccessOrigin> {
  public static type() {
    return "get-access-origin";
  }

  constructor(public readonly chainId: string) {
    super();
  }

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

  constructor(
    public readonly chainId: string,
    public readonly appOrigin: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Empty chain id");
    }

    if (!this.appOrigin) {
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
