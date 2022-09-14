import { Message } from "@keplr-wallet/router";
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
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateAutoLockAccountDurationMsg.type();
  }
}
