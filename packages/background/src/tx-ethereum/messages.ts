import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

// Return the tx hash
export class SendTxEthereumMsg extends Message<string> {
  public static type() {
    return "send-ethereum-tx-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly rawTx: string,
    public readonly silent?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tx", 100, "chain id is empty");
    }

    if (!this.rawTx) {
      throw new KeplrError("tx", 101, "tx is empty");
    }
  }

  override approveExternal(): boolean {
    // Silent mode is only allowed for the internal txs.
    return !this.silent;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SendTxEthereumMsg.type();
  }
}
