import { IAmountConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter, CoinPrimitive } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "./errors";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { useState } from "react";
import { QueriesStore } from "./internal";

export class StakedAmountConfig extends TxChainSetter implements IAmountConfig {
  @observable
  protected _sender: string;

  @observable
  protected _validatorAddress: string;

  @observable
  protected _amount: string;

  @observable
  protected _fraction: number | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore,
    initialChainId: string,
    sender: string,
    initialValidatorAddress: string
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
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
    this._fraction = isMax ? 1 : undefined;
  }

  @action
  toggleIsMax() {
    this.setIsMax(!this.isMax);
  }

  get isMax(): boolean {
    return this._fraction === 1;
  }

  get fraction(): number | undefined {
    return this._fraction;
  }

  @action
  setFraction(value: number | undefined) {
    this._fraction = value;
  }

  get sender(): string {
    return this._sender;
  }

  @computed
  get amount(): string {
    if (!this.queriesStore.get(this.chainId).cosmos) {
      throw new Error("No querier for delegations");
    }

    if (this.fraction != null) {
      const result = this.queriesStore
        .get(this.chainId)
        .cosmos!.queryDelegations.getQueryBech32Address(this.sender)
        .getDelegationTo(this.validatorAddress);

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

  @computed
  get error(): Error | undefined {
    if (!this.queriesStore.get(this.chainId).cosmos) {
      throw new Error("No querier for delegations");
    }

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
      return new NegativeAmountError("Amount is negative");
    }

    const balance = this.queriesStore
      .get(this.chainId)
      .cosmos!.queryDelegations.getQueryBech32Address(this.sender)
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
  queriesStore: QueriesStore,
  chainId: string,
  sender: string,
  validatorAddress: string
) => {
  const [txConfig] = useState(
    () =>
      new StakedAmountConfig(
        chainGetter,
        queriesStore,
        chainId,
        sender,
        validatorAddress
      )
  );
  txConfig.setChain(chainId);
  txConfig.setSender(sender);
  txConfig.setValidatorAddress(validatorAddress);

  return txConfig;
};
