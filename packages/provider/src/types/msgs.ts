import { Message } from "@keplr-wallet/router";

export class ChangeKeyRingNameMsg extends Message<string> {
  public static type() {
    return "change-keyring-name-msg";
  }

  constructor(
    public readonly defaultName: string,
    public readonly editable: boolean
  ) {
    super();
  }

  validateBasic(): void {
    // Not allow empty name.
    if (!this.defaultName) {
      throw new Error("default name not set");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return ChangeKeyRingNameMsg.type();
  }
}
