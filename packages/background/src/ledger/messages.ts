import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { LedgerApp } from "./ledger";

export class LedgerGetWebHIDFlagMsg extends Message<boolean> {
  public static type() {
    return "ledger-get-webhid-flag";
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
    return LedgerGetWebHIDFlagMsg.type();
  }
}

export class LedgerSetWebHIDFlagMsg extends Message<void> {
  public static type() {
    return "ledger-set-webhid-flag";
  }

  constructor(public readonly flag: boolean) {
    super();
  }

  validateBasic(): void {
    if (this.flag == null) {
      throw new Error("Flag is null");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerSetWebHIDFlagMsg.type();
  }
}

export class TryLedgerInitMsg extends Message<void> {
  public static type() {
    return "try-ledger-init";
  }

  constructor(
    public readonly ledgerApp: LedgerApp,
    public readonly cosmosLikeApp: string
  ) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return TryLedgerInitMsg.type();
  }
}
