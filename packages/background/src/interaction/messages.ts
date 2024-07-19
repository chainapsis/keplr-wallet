import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { InteractionWaitingData } from "./types";

export class GetInteractionWaitingDataArrayMsg extends Message<
  InteractionWaitingData[]
> {
  public static type() {
    return "GetInteractionWaitingDataArrayMsg";
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
    return GetInteractionWaitingDataArrayMsg.type();
  }
}

export class ApproveInteractionMsg extends Message<void> {
  public static type() {
    return "approve-interaction";
  }

  constructor(public readonly id: string, public readonly result: unknown) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveInteractionMsg.type();
  }
}

export class ApproveInteractionV2Msg extends Message<void> {
  public static type() {
    return "approve-interaction-v2";
  }

  constructor(public readonly id: string, public readonly result: unknown) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveInteractionV2Msg.type();
  }
}

export class RejectInteractionMsg extends Message<void> {
  public static type() {
    return "reject-interaction";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectInteractionMsg.type();
  }
}

export class RejectInteractionV2Msg extends Message<void> {
  public static type() {
    return "reject-interaction-v2";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectInteractionV2Msg.type();
  }
}
