import { IAmountConfig } from "./types";
import { TxChainSetter } from "./chain";
import {
  ChainGetter,
  CoinPrimitive,
  ObservableQueryDelegations,
} from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NagativeAmountError,
  ZeroAmountError,
} from "./errors";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { useState } from "react";

export class StakedAmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected queryDelegations: ObservableQueryDelegations;

  @observable
  protected _sender: string;

  @observable
  protected _validatorAddress: string;

  @observable
  protected _amount: string;

  @observable
  protected _isMax: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    queryDelegations: ObservableQueryDelegations,
    initialValidatorAddress: string
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    this.queryDelegations = queryDelegations;
    this._amount = "";
    this._validatorAddress = initialValidatorAddress;

    makeObservable(this);
  }

  @action
  setValidatorAddress(validatorAddress: string) {
    this._validatorAddress = validatorAddress;
  }

  get validatorAddress(): string {
    return this._validatorAddress;
  }

  @action
  setQueryDelegations(queryDelegations: ObservableQueryDelegations) {
    this.queryDelegations = queryDelegations;
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  @action
  setSendCurrency() {
    // noop
  }

  @action
  setAmount(amount: string) {
    if (amount.startsWith(".")) {
      amount = "0" + amount;
    }

    if (this.isMax) {
      this.setIsMax(false);
    }
    this._amount = amount;
  }

  @action
  setIsMax(isMax: boolean) {
    this._isMax = isMax;
  }

  @action
  toggleIsMax() {
    this._isMax = !this._isMax;
  }

  get isMax(): boolean {
    return this._isMax;
  }

  get sender(): string {
    return this._sender;
  }

  @computed
  get amount(): string {
    if (this.isMax) {
      const result = this.queryDelegations
        .getQueryBech32Address(this.sender)
        .getDelegationTo(this.validatorAddress);

      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      return result.trim(true).locale(false).hideDenom(true).toString();
    }

    return this._amount;
  }

  getAmountPrimitive(): CoinPrimitive {
    const amountStr = this.amount;
    const sendCurrency = this.sendCurrency;

    if (!amountStr) {
      return {
        denom: sendCurrency.coinMinimalDenom,
        amount: "0",
      };
    }

    try {
      return {
        denom: sendCurrency.coinMinimalDenom,
        amount: new Dec(amountStr)
          .mul(DecUtils.getPrecisionDec(sendCurrency.coinDecimals))
          .truncate()
          .toString(),
      };
    } catch {
      return {
        denom: sendCurrency.coinMinimalDenom,
        amount: "0",
      };
    }
  }

  @computed
  get sendCurrency(): AppCurrency {
    return this.chainInfo.stakeCurrency;
  }

  get sendableCurrencies(): AppCurrency[] {
    return [this.chainInfo.stakeCurrency];
  }

  getError(): Error | undefined {
    const sendCurrency = this.sendCurrency;
    if (!sendCurrency) {
      return new Error("Currency to send not set");
    }
    if (this.amount === "") {
      return new EmptyAmountError("Amount is empty");
    }
    if (Number.isNaN(parseFloat(this.amount))) {
      return new InvalidNumberAmountError("Invalid form of number");
    }
    let dec;
    try {
      dec = new Dec(this.amount);
      if (dec.equals(new Dec(0))) {
        return new ZeroAmountError("Amount is zero");
      }
    } catch {
      return new InvalidNumberAmountError("Invalid form of number");
    }
    if (new Dec(this.amount).lt(new Dec(0))) {
      return new NagativeAmountError("Amount is nagative");
    }

    const balance = this.queryDelegations
      .getQueryBech32Address(this.sender)
      .getDelegationTo(this.validatorAddress);
    const balanceDec = balance.toDec();
    if (dec.gt(balanceDec)) {
      return new InsufficientAmountError("Insufficient amount");
    }

    return;
  }
}

export const useStakedAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  queryDelegations: ObservableQueryDelegations,
  validatorAddress: string
) => {
  const [txConfig] = useState(
    () =>
      new StakedAmountConfig(
        chainGetter,
        chainId,
        sender,
        queryDelegations,
        validatorAddress
      )
  );
  txConfig.setChain(chainId);
  txConfig.setQueryDelegations(queryDelegations);
  txConfig.setSender(sender);
  txConfig.setValidatorAddress(validatorAddress);

  return txConfig;
};
