import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export type SkipHistory = {
  chainId: string;
  // TODO: Define the properties of the skip history
};

export class RecordTxWithSkipSwapMsg extends Message<string> {
  public static type() {
    return "record-tx-with-skip-swap";
  }

  // TODO: Define the properties of the message
  constructor() {
    super();
  }

  validateBasic(): void {
    // TODO: Implement validation
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RecordTxWithSkipSwapMsg.type();
  }
}

export class GetSkipHistoriesMsg extends Message<SkipHistory[]> {
  public static type() {
    return "get-skip-histories";
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
    return GetSkipHistoriesMsg.type();
  }
}

export class RemoveSkipHistoryMsg extends Message<SkipHistory[]> {
  public static type() {
    return "remove-skip-histories";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new Error("id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveSkipHistoryMsg.type();
  }
}

export class ClearAllSkipHistoryMsg extends Message<void> {
  public static type() {
    return "clear-all-skip-histories";
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
    return ClearAllSkipHistoryMsg.type();
  }
}
