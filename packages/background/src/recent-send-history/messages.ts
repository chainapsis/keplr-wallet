import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { IBCHistory, RecentSendHistory, SkipHistory } from "./types";
import { AppCurrency } from "@keplr-wallet/types";

export class GetRecentSendHistoriesMsg extends Message<RecentSendHistory[]> {
  public static type() {
    return "get-recent-send-histories";
  }

  constructor(
    public readonly chainId: string,
    public readonly historyType: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.historyType) {
      throw new Error("type is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRecentSendHistoriesMsg.type();
  }
}

export class AddRecentSendHistoryMsg extends Message<void> {
  public static type() {
    return "add-recent-send-history";
  }

  constructor(
    public readonly chainId: string,
    public readonly historyType: string,
    public readonly sender: string,
    public readonly recipient: string,
    public readonly amount: {
      readonly amount: string;
      readonly denom: string;
    }[],
    public readonly memo: string,
    public readonly ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[]
      | undefined
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.historyType) {
      throw new Error("type is empty");
    }

    if (!this.sender) {
      throw new Error("sender is empty");
    }

    if (!this.recipient) {
      throw new Error("recipient is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddRecentSendHistoryMsg.type();
  }
}

export class SendTxAndRecordMsg extends Message<Uint8Array> {
  public static type() {
    return "send-tx-and-record";
  }

  constructor(
    public readonly historyType: string,
    public readonly sourceChainId: string,
    public readonly destinationChainId: string,
    public readonly tx: unknown,
    public readonly mode: "async" | "sync" | "block",
    public readonly silent: boolean,
    public readonly sender: string,
    public readonly recipient: string,
    public readonly amount: {
      readonly amount: string;
      readonly denom: string;
    }[],
    public readonly memo: string,
    public readonly shouldLegacyTrack: boolean = false
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.historyType) {
      throw new Error("type is empty");
    }

    if (!this.sourceChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.destinationChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.tx) {
      throw new Error("tx is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new Error("invalid mode");
    }

    if (!this.sender) {
      throw new Error("sender is empty");
    }

    if (!this.recipient) {
      throw new Error("recipient is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SendTxAndRecordMsg.type();
  }

  withIBCPacketForwarding(
    channels: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    }[],
    notificationInfo: {
      currencies: AppCurrency[];
    }
  ): SendTxAndRecordWithIBCPacketForwardingMsg {
    return new SendTxAndRecordWithIBCPacketForwardingMsg(
      this.historyType,
      this.sourceChainId,
      this.destinationChainId,
      this.tx,
      channels,
      this.mode,
      this.silent,
      this.sender,
      this.recipient,
      this.amount,
      this.memo,
      notificationInfo
    );
  }
}

export class SendTxAndRecordWithIBCPacketForwardingMsg extends Message<Uint8Array> {
  public static type() {
    return "send-tx-and-record-with-ibc-packet-forwarding";
  }

  constructor(
    public readonly historyType: string,
    public readonly sourceChainId: string,
    public readonly destinationChainId: string,
    public readonly tx: unknown,
    public readonly channels: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    }[],
    public readonly mode: "async" | "sync" | "block",
    public readonly silent: boolean,
    public readonly sender: string,
    public readonly recipient: string,
    public readonly amount: {
      readonly amount: string;
      readonly denom: string;
    }[],
    public readonly memo: string,
    public readonly notificationInfo: {
      currencies: AppCurrency[];
    }
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.historyType) {
      throw new Error("type is empty");
    }

    if (!this.sourceChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.destinationChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.tx) {
      throw new Error("tx is empty");
    }

    if (this.channels.length === 0) {
      throw new Error("channels is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new Error("invalid mode");
    }

    if (!this.sender) {
      throw new Error("sender is empty");
    }

    if (!this.recipient) {
      throw new Error("recipient is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SendTxAndRecordWithIBCPacketForwardingMsg.type();
  }
}

export class SendTxAndRecordWithIBCSwapMsg extends Message<Uint8Array> {
  public static type() {
    return "send-tx-and-record-with-ibc-swap";
  }

  constructor(
    public readonly swapType: "amount-in" | "amount-out",
    public readonly sourceChainId: string,
    public readonly destinationChainId: string,
    public readonly tx: unknown,
    public readonly channels: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    }[],
    public readonly destinationAsset: {
      chainId: string;
      denom: string;
    },
    public readonly swapChannelIndex: number,
    public readonly swapReceiver: string[],
    public readonly mode: "async" | "sync" | "block",
    public readonly silent: boolean,
    public readonly sender: string,
    public readonly amount: {
      readonly amount: string;
      readonly denom: string;
    }[],
    public readonly memo: string,
    public readonly notificationInfo: {
      currencies: AppCurrency[];
    },
    public readonly shouldLegacyTrack: boolean = false
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.swapType) {
      throw new Error("type is empty");
    }

    if (!this.sourceChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.destinationChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.tx) {
      throw new Error("tx is empty");
    }

    // XXX: swap chain 안에서만 이루어지는 경우 ibc channel이 필요 없을 수도 있음
    // if (this.channels.length === 0) {
    //   throw new Error("channels is empty");
    // }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new Error("invalid mode");
    }

    if (!this.sender) {
      throw new Error("sender is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SendTxAndRecordWithIBCSwapMsg.type();
  }
}

export class GetIBCHistoriesMsg extends Message<IBCHistory[]> {
  public static type() {
    return "get-ibc-histories";
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
    return GetIBCHistoriesMsg.type();
  }
}

export class RemoveIBCHistoryMsg extends Message<IBCHistory[]> {
  public static type() {
    return "remove-ibc-histories";
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
    return RemoveIBCHistoryMsg.type();
  }
}

export class ClearAllIBCHistoryMsg extends Message<void> {
  public static type() {
    return "clear-all-ibc-histories";
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
    return ClearAllIBCHistoryMsg.type();
  }
}

export class RecordTxWithSkipSwapMsg extends Message<string> {
  public static type() {
    return "record-tx-with-skip-swap";
  }

  constructor(
    public readonly sourceChainId: string,
    public readonly destinationChainId: string,
    public readonly destinationAsset: {
      chainId: string;
      denom: string;
      expectedAmount: string;
    },
    public readonly simpleRoute: {
      isOnlyEvm: boolean;
      chainId: string;
      receiver: string;
    }[],
    public readonly sender: string,
    public readonly recipient: string,

    // amount 대신 amountIn, amountOut을 사용하도록 변경

    public readonly amount: {
      readonly amount: string;
      readonly denom: string;
    }[],
    public readonly notificationInfo: {
      currencies: AppCurrency[];
    },
    public readonly routeDurationSeconds: number,
    public readonly txHash: string,
    public readonly isOnlyUseBridge?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.sourceChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.destinationChainId) {
      throw new Error("chain id is empty");
    }

    if (!this.simpleRoute) {
      throw new Error("simple route is empty");
    }

    if (!this.sender) {
      throw new Error("sender is empty");
    }

    if (!this.recipient) {
      throw new Error("recipient is empty");
    }
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
