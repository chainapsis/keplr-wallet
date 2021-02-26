import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

import { Buffer } from "buffer/";

// Return hex encoded result
export class GetPubkeyMsg extends Message<string> {
  public static type() {
    return "get-pubkey-msg";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetPubkeyMsg.type();
  }
}

// Return hex encoded result
export class ReqeustEncryptMsg extends Message<string> {
  public static type() {
    return "request-encrypt-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    public readonly msg: object
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.contractCodeHash) {
      throw new Error("contract code hash not set");
    }

    if (!this.msg) {
      throw new Error("msg not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ReqeustEncryptMsg.type();
  }
}

// Return hex encoded result
export class RequestDecryptMsg extends Message<string> {
  public static type() {
    return "request-decrypt-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly cipherTextHex: string,
    public readonly nonceHex: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.cipherTextHex) {
      throw new Error("ciphertext not set");
    }

    // Make sure that cipher text hex is encoded by hex.
    Buffer.from(this.cipherTextHex, "hex");

    if (!this.nonceHex) {
      throw new Error("nonce not set");
    }

    // Make sure that nonce hex is encoded by hex.
    Buffer.from(this.nonceHex, "hex");
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestDecryptMsg.type();
  }
}
