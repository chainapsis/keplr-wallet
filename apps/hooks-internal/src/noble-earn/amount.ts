import { AmountConfig, ISenderConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosAccount,
  IAccountStoreWithInjects,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { useState } from "react";
import { makeObservable, observable } from "mobx";

export class NobleEarnAmountConfig extends AmountConfig {
  @observable.ref
  protected _outCurrency: AppCurrency;

  constructor(
    chainGetter: ChainGetter,
    queriesStore: IQueriesStore,
    protected readonly accountStore: IAccountStoreWithInjects<[CosmosAccount]>,
    chainId: string,
    senderConfig: ISenderConfig,
    initialOutCurrency: AppCurrency
  ) {
    super(chainGetter, queriesStore, chainId, senderConfig);

    this._outCurrency = initialOutCurrency;

    makeObservable(this);
  }

  get outCurrency(): AppCurrency {
    return this._outCurrency;
  }

  setOutCurrency(currency: AppCurrency): void {
    this._outCurrency = currency;
  }

  get expectedOutAmount(): CoinPretty {
    const nobleSwapRates =
      this.queriesStore
        .get(this.chainId)
        .noble?.querySwapRates.getQueryCoinMinimalDenom(
          this.currency.coinMinimalDenom
        ).rates ?? [];

    const outCurrencySwapRate = nobleSwapRates.find(
      (rate) => rate.vs === this.outCurrency.coinMinimalDenom
    );

    // Expected out amount is the amount of the input currency multiplied by the price of the output currency.
    return new CoinPretty(this.outCurrency, this.amount[0].toCoin().amount).mul(
      new Dec(outCurrencySwapRate?.price ?? "0")
    );
  }
}

export const useNobleEarnAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount]>,
  chainId: string,
  senderConfig: ISenderConfig,
  inCurrency: AppCurrency,
  outCurrency: AppCurrency
) => {
  const [txConfig] = useState(
    () =>
      new NobleEarnAmountConfig(
        chainGetter,
        queriesStore,
        accountStore,
        chainId,
        senderConfig,
        outCurrency
      )
  );
  txConfig.setChain(chainId);
  txConfig.setCurrency(inCurrency);
  txConfig.setOutCurrency(outCurrency);

  return txConfig;
};
