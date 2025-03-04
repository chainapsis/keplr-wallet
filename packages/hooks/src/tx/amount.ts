import {
  IAmountConfig,
  IFeeConfig,
  ISenderConfig,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  NotSupportedCurrencyError,
  ZeroAmountError,
} from "./errors";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { useState } from "react";
import { QueriesStore } from "./internal";

export class AmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected _currency?: AppCurrency = undefined;

  @observable
  protected _value: string = "";

  @observable
  protected _fraction: number = 0;

  @observable.ref
  protected _feeConfig: IFeeConfig | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  get feeConfig(): IFeeConfig | undefined {
    return this._feeConfig;
  }

  @action
  setFeeConfig(feeConfig: IFeeConfig | undefined) {
    this._feeConfig = feeConfig;
  }

  @computed
  get value(): string {
    if (this.fraction > 0) {
      let result = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.senderConfig.sender)
        .getBalanceFromCurrency(this.currency);
      if (this.feeConfig) {
        for (const fee of this.feeConfig.fees) {
          result = result.sub(fee);
        }
      }
      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      return result
        .mul(new Dec(this.fraction))
        .trim(true)
        .locale(false)
        .hideDenom(true)
        .toString();
    }

    return this._value;
  }

  @action
  setValue(value: string): void {
    if (value.startsWith(".")) {
      value = "0" + value;
    }

    this._value = value;

    this.setFraction(0);
  }

  @computed
  get amount(): CoinPretty[] {
    let amount: Dec;
    try {
      if (this.value.trim() === "") {
        amount = new Dec(0);
      } else {
        amount = new Dec(this.value);
      }
    } catch {
      amount = new Dec(0);
    }

    return [
      new CoinPretty(
        this.currency,
        amount
          .mul(DecUtils.getTenExponentN(this.currency.coinDecimals))
          .truncate()
      ),
    ];
  }

  @computed
  get currency(): AppCurrency {
    const chainInfo = this.chainInfo;

    if (this._currency) {
      const find = chainInfo.findCurrency(this._currency.coinMinimalDenom);
      if (find) {
        return find;
      }
    }

    if (chainInfo.currencies.length === 0) {
      throw new Error("Chain doesn't have the sendable currency informations");
    }

    return chainInfo.currencies[0];
  }

  @action
  setCurrency(currency: AppCurrency | undefined) {
    if (currency?.coinMinimalDenom !== this._currency?.coinMinimalDenom) {
      this._value = "";
      this.setFraction(0);
    }

    this._currency = currency;
  }

  get fraction(): number {
    return this._fraction;
  }

  @action
  setFraction(fraction: number): void {
    this._fraction = fraction;
  }

  canUseCurrency(currency: AppCurrency): boolean {
    return this.chainInfo.findCurrency(currency.coinMinimalDenom) != null;
  }

  @computed
  get uiProperties(): UIProperties {
    if (!this.currency) {
      return {
        error: new Error("Currency to send not set"),
      };
    }

    if (this.value.trim() === "") {
      return {
        error: new EmptyAmountError("Amount is empty"),
      };
    }

    try {
      const dec = new Dec(this.value);
      if (dec.equals(new Dec(0))) {
        return {
          error: new ZeroAmountError("Amount is zero"),
        };
      }
      if (dec.lt(new Dec(0))) {
        return {
          error: new NegativeAmountError("Amount is negative"),
        };
      }
    } catch {
      return {
        error: new InvalidNumberAmountError("Invalid form of number"),
      };
    }

    for (const amount of this.amount) {
      const currency = amount.currency;

      if (!this.canUseCurrency(currency)) {
        return {
          error: new NotSupportedCurrencyError("Not supported currency"),
        };
      }

      const bal = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.senderConfig.sender)
        .balances.find(
          (bal) => bal.currency.coinMinimalDenom === currency.coinMinimalDenom
        );

      if (!bal) {
        return {
          warning: new Error(
            `Can't parse the balance for ${currency.coinMinimalDenom}`
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

      if (bal.balance.toDec().lt(amount.toDec())) {
        return {
          error: new InsufficientAmountError("Insufficient balance"),
          loadingState: bal.isFetching ? "loading" : undefined,
        };
      }
    }

    return {};
  }
}

export const useAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  senderConfig: ISenderConfig
) => {
  const [txConfig] = useState(
    () => new AmountConfig(chainGetter, queriesStore, chainId, senderConfig)
  );
  txConfig.setChain(chainId);

  return txConfig;
};
