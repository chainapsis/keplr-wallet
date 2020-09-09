import { Message } from "../../common/message";
import {
  AccessOrigin,
  ChainInfo,
  ChainInfoWithEmbed,
  SuggestedChainInfo
} from "./types";
import { ROUTE } from "./constants";
import { AsyncApprover } from "../../common/async-approver";

export class GetChainInfosMsg extends Message<{
  chainInfos: ChainInfoWithEmbed[];
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

export class SuggestChainInfoMsg extends Message<void> {
  public static type() {
    return "suggest-chain-info";
  }

  constructor(
    public readonly chainInfo: ChainInfo,
    public readonly openPopup: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainInfo) {
      throw new Error("chain info not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SuggestChainInfoMsg.type();
  }
}

export class GetSuggestedChainInfoMsg extends Message<SuggestedChainInfo> {
  public static type() {
    return "get-suggested-chain-info";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSuggestedChainInfoMsg.type();
  }
}

export class ApproveSuggestedChainInfoMsg extends Message<void> {
  public static type() {
    return "approve-suggested-chain-info";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveSuggestedChainInfoMsg.type();
  }
}

export class RejectSuggestedChainInfoMsg extends Message<void> {
  public static type() {
    return "reject-suggested-chain-info";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSuggestedChainInfoMsg.type();
  }
}

export class RemoveSuggestedChainInfoMsg extends Message<ChainInfoWithEmbed[]> {
  public static type() {
    return "remove-suggested-chain-info";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveSuggestedChainInfoMsg.type();
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

    const url = new URL(this.appOrigin);
    if (!url.origin || url.origin === "null") {
      throw new Error("Invalid app origin");
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

    const url = new URL(this.appOrigin);
    if (!url.origin || url.origin === "null") {
      throw new Error("Invalid app origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveAccessOriginMsg.type();
  }
}
