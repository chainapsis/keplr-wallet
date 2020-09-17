import { Message } from "../../../common/message";
import { ROUTE } from "./constants";

export class LedgerInitFailedMsg extends Message<void> {
  public static type() {
    return "ledger-init-failed";
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerInitFailedMsg.type();
  }
}

export class LedgerInitAbortedMsg extends Message<void> {
  public static type() {
    return "ledger-init-aborted";
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerInitAbortedMsg.type();
  }
}

export class LedgerInitResumedMsg extends Message<void> {
  public static type() {
    return "ledger-init-resumed";
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerInitResumedMsg.type();
  }
}

export class LedgerGetPublicKeyCompletedMsg extends Message<void> {
  public static type() {
    return "ledger-get-public-key-completed";
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerGetPublicKeyCompletedMsg.type();
  }
}

export class LedgerSignCompletedMsg extends Message<void> {
  public static type() {
    return "ledger-sign-completed";
  }

  constructor(public readonly rejected: boolean) {
    super();
  }

  validateBasic(): void {
    // notop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerSignCompletedMsg.type();
  }
}
