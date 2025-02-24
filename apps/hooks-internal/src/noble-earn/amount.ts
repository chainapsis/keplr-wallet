import {
  AmountConfig,
  ISenderConfig,
  useFeeConfig,
  useGasConfig,
  useSenderConfig,
} from "@keplr-wallet/hooks";
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

    // TODO: It needs to confirm from noble team how to calculate the expected amount
    return new CoinPretty(this.outCurrency, this.amount[0].toCoin().amount).quo(
      new Dec(outCurrencySwapRate?.price ?? "1")
    );
  }

  get minOutAmount(): CoinPretty {
    // TODO: It needs to confirm from noble team how to calculate the minimal amount
    // Temporarily, It subtracts 0.5% slippage from the expected amount
    return this.expectedOutAmount.mul(new Dec(0.995));
  }
}

export const useNobleEarnAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount]>,
  chainId: string,
  sender: string,
  inCurrency: AppCurrency,
  outCurrency: AppCurrency
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);

  const [amountConfig] = useState(
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
  amountConfig.setChain(chainId);
  amountConfig.setCurrency(inCurrency);
  amountConfig.setOutCurrency(outCurrency);

  const gasConfig = useGasConfig(chainGetter, chainId);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );

  amountConfig.setFeeConfig(feeConfig);

  return {
    senderConfig,
    amountConfig,
    gasConfig,
    feeConfig,
  };
};
