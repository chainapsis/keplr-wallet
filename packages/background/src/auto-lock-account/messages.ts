import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetAutoLockAccountDurationMsg extends Message<number> {
  public static type() {
    return "get-auto-lock-account-duration";
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
    return GetAutoLockAccountDurationMsg.type();
  }
}

export class UpdateAutoLockAccountDurationMsg extends Message<void> {
  public static type() {
    return "update-auto-lock-account-duration";
  }

  constructor(public readonly duration: number) {
    super();
  }

  validateBasic(): void {
    if (this.duration < 0) {
      throw new KeplrError(
        "auto-lock-account",
        101,
        "duration cannot be set to a negative number."
      );
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateAutoLockAccountDurationMsg.type();
  }
}

export class StartAutoLockMonitoringMsg extends Message<void> {
  public static type() {
    return "start-auto-lock-monitoring";
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
    return StartAutoLockMonitoringMsg.type();
  }
}

export class GetLockOnSleepMsg extends Message<boolean> {
  public static type() {
    return "get-lock-on-sleep";
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
    return GetLockOnSleepMsg.type();
  }
}

export class SetLockOnSleepMsg extends Message<void> {
  public static type() {
    return "set-lock-on-sleep";
  }

  constructor(public readonly lockOnSleep: boolean) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetLockOnSleepMsg.type();
  }
}

export class GetAutoLockStateMsg extends Message<{
  duration: number;
  lockOnSleep: boolean;
}> {
  public static type() {
    return "get-auto-lock-state";
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
    return GetAutoLockStateMsg.type();
  }
}
