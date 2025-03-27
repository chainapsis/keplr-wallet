import { KeplrError, Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

// Return the tx hash
export class SendTxEthereumMsg extends Message<string> {
  public static type() {
    return "send-ethereum-tx-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly tx: Uint8Array,
    public readonly silent?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tx", 100, "chain id is empty");
    }

    if (!this.tx) {
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

export class SendTxEthereumMsgAndRecordMsg extends Message<string> {
  public static type() {
    return "send-ethereum-tx-to-background-and-record-msg";
  }

  constructor(
    public readonly historyType: string,
    public readonly chainId: string,
    public readonly destinationChainId: string,
    public readonly tx: Uint8Array,
    public readonly sender: string,
    public readonly recipient: string,
    public readonly amount: {
      readonly amount: string;
      readonly denom: string;
    }[],
    public readonly memo: string,
    public readonly silent?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("tx", 100, "chain id is empty");
    }

    if (!this.tx) {
      throw new KeplrError("tx", 101, "tx is empty");
    }

    if (!this.historyType) {
      throw new Error("type is empty");
    }

    if (!this.destinationChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.sender) {
      throw new Error("sender is empty");
    }

    if (!this.recipient) {
      throw new Error("recipient is empty");
    }

    if (!this.amount) {
      throw new Error("amount is empty");
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
    return SendTxEthereumMsgAndRecordMsg.type();
  }
}
