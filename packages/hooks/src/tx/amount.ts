import { IAmountConfig, IFeeConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter, CoinPrimitive } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { ObservableQueryBalances } from "@keplr-wallet/stores/build/query/balances";
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

export class AmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected feeConfig?: IFeeConfig;

  @observable.ref
  protected queryBalances: ObservableQueryBalances;

  @observable
  protected _sender: string;

  @observable.ref
  protected _sendCurrency?: AppCurrency = undefined;

  @observable
  protected _amount: string;

  @observable
  protected _isMax: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined,
    queryBalances: ObservableQueryBalances
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    this.feeConfig = feeConfig;
    this.queryBalances = queryBalances;
    this._amount = "";

    makeObservable(this);
  }

  @action
  setFeeConfig(feeConfig: IFeeConfig) {
    this.feeConfig = feeConfig;
  }

  @action
  setQueryBalances(queryBalances: ObservableQueryBalances) {
    this.queryBalances = queryBalances;
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  @action
  setSendCurrency(currency: AppCurrency | undefined) {
    this._sendCurrency = currency;
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
      const balance = this.queryBalances
        .getQueryBech32Address(this.sender)
        .getBalanceFromCurrency(this.sendCurrency);

      const result = this.feeConfig?.fee
        ? balance.sub(this.feeConfig.fee)
        : balance;
      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      // Remember that the `CoinPretty`'s sub method do nothing if the currencies are different.
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
    const chainInfo = this.chainInfo;

    if (this._sendCurrency) {
      const find = chainInfo.currencies.find(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (cur) => cur.coinMinimalDenom === this._sendCurrency!.coinMinimalDenom
      );
      if (find) {
        return this._sendCurrency;
      }
    }

    if (chainInfo.currencies.length === 0) {
      throw new Error("Chain doesn't have the sendable currency informations");
    }

    return chainInfo.currencies[0];
  }

  get sendableCurrencies(): AppCurrency[] {
    return this.chainInfo.currencies;
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

    const balance = this.queryBalances
      .getQueryBech32Address(this.sender)
      .getBalanceFromCurrency(this.sendCurrency);
    const balanceDec = balance.toDec();
    if (dec.gt(balanceDec)) {
      return new InsufficientAmountError("Insufficient amount");
    }

    return;
  }
}

export const useAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  queryBalances: ObservableQueryBalances
) => {
  const [txConfig] = useState(
    () =>
      new AmountConfig(chainGetter, chainId, sender, undefined, queryBalances)
  );
  txConfig.setChain(chainId);
  txConfig.setQueryBalances(queryBalances);
  txConfig.setSender(sender);

  return txConfig;
};
