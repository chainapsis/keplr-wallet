import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetAutoLockAccountIntervalMsg extends Message<number> {
  public static type() {
    return "get-auto-lock-account-interval";
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
    return GetAutoLockAccountIntervalMsg.type();
  }
}

export class UpdateAutoLockAccountIntervalMsg extends Message<void> {
  public static type() {
    return "update-auto-lock-account-interval";
  }

  constructor(public readonly interval: number) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateAutoLockAccountIntervalMsg.type();
  }
}

export class UpdateAppLastUsedTimeMsg extends Message<void> {
  public static type() {
    return "update-app-last-used-time";
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
    return UpdateAppLastUsedTimeMsg.type();
  }
}
