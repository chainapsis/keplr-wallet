import { IAmountConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter, CoinPrimitive } from "@keplr/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { ObservableQueryBalances } from "@keplr/stores/build/query/balances";
import { AppCurrency } from "@keplr/types";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NagativeAmountError,
  ZeroAmountError,
} from "./errors";
import { Dec, DecUtils } from "@keplr/unit";
import { useState } from "react";

export class AmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected queryBalances: ObservableQueryBalances;

  @observable
  protected _sender: string;

  @observable.ref
  protected _sendCurrency?: AppCurrency = undefined;

  @observable
  protected _amount: string;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    queryBalances: ObservableQueryBalances
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    this.queryBalances = queryBalances;
    this._amount = "";

    makeObservable(this);
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

    this._amount = amount;
  }

  get sender(): string {
    return this._sender;
  }

  get amount(): string {
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

    return {
      denom: sendCurrency.coinMinimalDenom,
      amount: new Dec(amountStr)
        .mul(DecUtils.getPrecisionDec(sendCurrency.coinDecimals))
        .truncate()
        .toString(),
    };
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
    const dec = new Dec(this.amount);
    if (dec.equals(new Dec(0))) {
      return new ZeroAmountError("Amount is zero");
    }
    if (new Dec(this.amount).lt(new Dec(0))) {
      return new NagativeAmountError("Amount is nagative");
    }

    const balances = this.queryBalances.getQueryBech32Address(this.sender)
      .balances;

    const balance = balances.find(
      (bal) => bal.currency.coinMinimalDenom === sendCurrency.coinMinimalDenom
    );
    if (!balance) {
      return new InsufficientAmountError("Insufficient amount");
    } else {
      const balanceDec = balance.balance.toDec();
      if (dec.gt(balanceDec)) {
        return new InsufficientAmountError("Insufficient amount");
      }
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
    new AmountConfig(chainGetter, chainId, sender, queryBalances)
  );
  txConfig.setChain(chainId);
  txConfig.setQueryBalances(queryBalances);
  txConfig.setSender(sender);

  return txConfig;
};
