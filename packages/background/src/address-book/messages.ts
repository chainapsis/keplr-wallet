import { AddressBookEntry } from "@fetchai/wallet-types";
import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class ListEntriesMsg extends Message<AddressBookEntry[]> {
  public static type() {
    return "list-entries-msg";
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
    return ListEntriesMsg.type();
  }
}

export class AddEntryMsg extends Message<void> {
  public static type() {
    return "add-entry-msg";
  }

  constructor(public readonly entry: AddressBookEntry) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddEntryMsg.type();
  }
}

export class UpdateEntryMsg extends Message<void> {
  public static type() {
    return "update-entry-msg";
  }

  constructor(public readonly entry: AddressBookEntry) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateEntryMsg.type();
  }
}

export class DeleteEntryMsg extends Message<void> {
  public static type() {
    return "delete-entry-msg";
  }

  constructor(public readonly address: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeleteEntryMsg.type();
  }
}
