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

    // Validate bech32 address.
    Bech32Address.validate(this.signer);
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
