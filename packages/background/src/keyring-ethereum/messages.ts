import { Bech32Address } from "@keplr-wallet/cosmos";
import { Message } from "@keplr-wallet/router";
import { EthSignType } from "@keplr-wallet/types";
import { ROUTE } from "./constants";

export class RequestSignEthereumMsg extends Message<Uint8Array> {
  public static type() {
    return "request-sign-ethereum";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly message: Uint8Array,
    public readonly signType: EthSignType
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    if (!this.signType) {
      throw new Error("sign type not set");
    }

    // Validate signer address.
    try {
      Bech32Address.validate(this.signer);
    } catch {
      const tempSigner =
        this.signer.substring(0, 2) === "0x" ? this.signer : "0x" + this.signer;
      if (!tempSigner.match(/^0x[0-9A-Fa-f]*$/) || tempSigner.length !== 42) {
        throw new Error("Signer is not valid hex address");
      }
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignEthereumMsg.type();
  }
}

export class RequestJsonRpcToEvmMsg extends Message<void> {
  public static type() {
    return "request-json-rpc-to-evm";
  }

  constructor(
    public readonly method: string,
    public readonly params?: unknown[] | Record<string, unknown>,
    public readonly providerId?: string
  ) {
    super();
  }

  validateBasic(): void {}

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestJsonRpcToEvmMsg.type();
  }
}
