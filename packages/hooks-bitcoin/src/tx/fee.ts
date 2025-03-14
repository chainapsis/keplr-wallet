import {
  IAmountConfig,
  IFeeConfig,
  IFeeRateConfig,
  ISenderConfig,
  ITxSizeConfig,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { InsufficientFeeError } from "./errors";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable
  protected _disableBalanceCheck: boolean = false;

  @observable
  protected _value: string = "";

  constructor(
    chainGetter: ChainGetter,
    protected readonly bitcoinQueriesStore: BitcoinQueriesStore,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig,
    protected readonly amountConfig: IAmountConfig,
    protected readonly txSizeConfig: ITxSizeConfig,
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

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string) {
    this._value = value;
  }

  get fee(): CoinPretty | undefined {
    if (this.value.trim() === "") {
      if (this.txSizeConfig.txSize === undefined) {
        return undefined;
      }

      return new CoinPretty(
        this.amountConfig.currency,
        this.txSizeConfig.txSize * this.feeRateConfig.feeRate
      );
    }

    return new CoinPretty(this.amountConfig.currency, this._value);
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

    const amount = this.amountConfig.amount;

    // TODO: check available balance rather than total balance
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

    const need = amount.reduce((acc, cur) => {
      return acc.add(new Dec(cur.toCoin().amount));
    }, new Dec(0));

    if (
      new Dec(bal.balance.toCoin().amount).lt(
        new Dec(fee.toCoin().amount).add(need)
      )
    ) {
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
  txSizeConfig: ITxSizeConfig,
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
      txSizeConfig,
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
