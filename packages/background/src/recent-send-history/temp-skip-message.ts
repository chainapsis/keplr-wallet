import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { AppCurrency } from "@keplr-wallet/types";
import { SkipHistory } from "./types";

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

    // amount 대신 amountIn, amountOut을 사용하도록 변경

    public readonly amount: {
      readonly amount: string;
      readonly denom: string;
    }[],
    public readonly notificationInfo: {
      currencies: AppCurrency[];
    },
    public readonly routeDurationSeconds: number,
    public readonly isSkipTrack: boolean = false,
    public readonly txHash: string
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
