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
import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { useState } from "react";
import { QueriesStore } from "./internal";

export class StakedAmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected _currency?: AppCurrency = undefined;

  @observable
  protected _validatorAddress: string;

  @observable
  protected _fraction: number = 0;

  @observable
  protected _value: string = "";

  @observable.ref
  protected _feeConfig: IFeeConfig | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore,
    initialChainId: string,
    initialValidatorAddress: string,
    protected readonly senderConfig: ISenderConfig
  ) {
    super(chainGetter, initialChainId);

    this._validatorAddress = initialValidatorAddress;

    makeObservable(this);
  }

  get feeConfig(): IFeeConfig | undefined {
    return this._feeConfig;
  }

  @action
  setFeeConfig(feeConfig: IFeeConfig | undefined) {
    this._feeConfig = feeConfig;
  }

  @action
  setValidatorAddress(validatorAddress: string) {
    this._validatorAddress = validatorAddress;
  }

  get validatorAddress(): string {
    return this._validatorAddress;
  }

  get fraction(): number {
    return this._fraction;
  }

  @action
  setFraction(value: number) {
    this._fraction = value;
  }

  canUseCurrency(currency: AppCurrency): boolean {
    return (
      this.chainGetter.getModularChainInfoImpl(this.chainId).stakeCurrency
        ?.coinMinimalDenom === currency.coinMinimalDenom
    );
  }

  @computed
  get value(): string {
    if (this.fraction > 0) {
      const result = this.queriesStore
        .get(this.chainId)
        .cosmos?.queryDelegations.getQueryBech32Address(
          this.senderConfig.sender
        )
        .getDelegationTo(this.validatorAddress);

      if (!result) {
        return "0";
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
    const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    );

    if (modularChainInfoImpl.stakeCurrency) {
      return modularChainInfoImpl.stakeCurrency;
    }

    if (this._currency) {
      const find = modularChainInfoImpl.findCurrency(
        this._currency.coinMinimalDenom
      );
      if (find) {
        return find;
      }
    }

    if (modularChainInfoImpl.getCurrencies().length === 0) {
      throw new Error("Chain doesn't have the sendable currency informations");
    }

    return modularChainInfoImpl.getCurrencies()[0];
  }

  @action
  setCurrency(currency: AppCurrency | undefined) {
    if (currency?.coinMinimalDenom !== this._currency?.coinMinimalDenom) {
      this._value = "";
      this.setFraction(0);
    }

    this._currency = currency;
  }

  @computed
  get sendCurrency(): AppCurrency {
    const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    );

    return (
      modularChainInfoImpl.stakeCurrency ||
      modularChainInfoImpl.getCurrencies()[0]
    );
  }

  @computed
  get uiProperties(): UIProperties {
    if (!this.queriesStore.get(this.chainId).cosmos) {
      return {
        error: new Error("No querier for delegations"),
      };
    }

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
        .cosmos!.queryDelegations.getQueryBech32Address(
          this.senderConfig.sender
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

      if (
        (bal.getDelegationTo(this.validatorAddress) || new Int(0))
          .toDec()
          .lt(amount.toDec())
      ) {
        return {
          error: new InsufficientAmountError("Insufficient amount"),
          loadingState: bal.isFetching ? "loading" : undefined,
        };
      }
    }

    return {};
  }
}

export const useStakedAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  validatorAddress: string,
  senderConfig: ISenderConfig
) => {
  const [txConfig] = useState(
    () =>
      new StakedAmountConfig(
        chainGetter,
        queriesStore,
        chainId,
        validatorAddress,
        senderConfig
      )
  );
  txConfig.setChain(chainId);
  txConfig.setValidatorAddress(validatorAddress);

  return txConfig;
};
