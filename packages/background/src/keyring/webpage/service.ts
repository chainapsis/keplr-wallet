import { KeyStoreEventHandler } from "./types";

export class KeyStoreEventService {
  constructor(protected handler: KeyStoreEventHandler) {}

  keyStoreChanged() {
    this.handler.onKeyStoreChanged();
  }
}
