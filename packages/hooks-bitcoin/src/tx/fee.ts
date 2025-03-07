import {
  IAmountConfig,
  IFeeConfig,
  IFeeRateConfig,
  ISenderConfig,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { InsufficientFeeError } from "./errors";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable.ref
  protected _fee: CoinPretty | null = null;

  @observable
  protected _vsize: number | undefined = undefined;
  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    protected readonly bitcoinQueriesStore: BitcoinQueriesStore,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig,
    protected readonly amountConfig: IAmountConfig,
    protected readonly feeRateConfig: IFeeRateConfig
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }

  get fee(): CoinPretty | undefined {
    if (!this._fee) {
      if (!this._vsize) {
        return;
      }

      const fee = this.feeRateConfig.feeRate * this._vsize;
      // bitcoin will never? has another fee currency than satoshi. (I think)
      return new CoinPretty(this.amountConfig.currency, new Dec(fee));
    }

    return this._fee;
  }

  @action
  setFee(fee: CoinPretty | null) {
    this._fee = fee;
  }

  get vsize(): number | undefined {
    return this._vsize;
  }

  @action
  setVsize(vsize: number) {
    this._vsize = vsize;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this.disableBalanceCheck) {
      return {};
    }

    const fee = this.fee;

    if (!fee) {
      return {
        error: new Error("Fee is not set"),
        loadingState: "loading-block",
      };
    }

    const bal = this.bitcoinQueriesStore
      .get(this.chainId)
      .queryBitcoinBalance.getBalance(
        this.chainId,
        this.chainGetter,
        this.senderConfig.value,
        fee.currency.coinMinimalDenom
      );

    if (!bal) {
      return {
        warning: new Error(
          `Can't parse the balance for ${fee.currency.coinMinimalDenom}`
        ),
      };
    }

    if (bal.error) {
      return {
        warning: new Error("Failed to fetch balance"),
      };
    }

    if (!bal.response) {
      return {
        loadingState: "loading-block",
      };
    }

    if (new Int(bal.balance.toCoin().amount).lt(new Int(fee.toCoin().amount))) {
      return {
        error: new InsufficientFeeError("Insufficient fee"),
        loadingState: bal.isFetching ? "loading" : undefined,
      };
    }

    return {};
  }
}

export const useFeeConfig = (
  chainGetter: ChainGetter,
  queriesStore: BitcoinQueriesStore,
  chainId: string,
  senderConfig: ISenderConfig,
  amountConfig: IAmountConfig,
  feeRateConfig: IFeeRateConfig,
  initialFn?: (config: FeeConfig) => void
) => {
  const [config] = useState(() => {
    const config = new FeeConfig(
      chainGetter,
      queriesStore,
      chainId,
      senderConfig,
      amountConfig,
      feeRateConfig
    );

    if (initialFn) {
      initialFn(config);
    }

    return config;
  });
  config.setChain(chainId);

  return config;
};
