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
  NobleSwapPool,
  ObservableQueryNobleSwapSimulateSwapInner,
} from "@keplr-wallet/stores";
import { useState } from "react";
import { action, makeObservable, observable } from "mobx";

// Slippage is 0.5%
const SLIPPAGE = new Dec(0.005);

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

  @action
  setOutCurrency(currency: AppCurrency): void {
    this._outCurrency = currency;
  }

  get error(): Error | undefined {
    if (this.amount[0].toDec().isZero()) {
      return;
    }

    const min = this.amount[0].mul(new Dec(0.99));
    const queryNobleSwapSimulateSwap = this.querySimulateSwap(min);

    const isLessThanMin =
      queryNobleSwapSimulateSwap?.error?.message.includes("min amount") ||
      queryNobleSwapSimulateSwap?.simulatedOutAmount?.toDec().lt(min.toDec());

    if (isLessThanMin) {
      return new Error("Estimated out amount is less than expected");
    }

    return queryNobleSwapSimulateSwap?.error
      ? new Error(queryNobleSwapSimulateSwap?.error?.message)
      : undefined;
  }

  get pool(): NobleSwapPool | undefined {
    const rates = this.queriesStore
      .get(this.chainId)
      .noble?.querySwapRates.getQueryCoinMinimalDenom(
        this.amount[0].currency.coinMinimalDenom
      ).rates;

    const bestRate = rates?.reduce((best, rate) => {
      if (new Dec(best.price).gt(new Dec(rate.price))) {
        return rate;
      }
      return best;
    }, rates?.[0]);

    const pools = this.queriesStore.get(this.chainId).noble?.querySwapPools
      .pools;

    return pools?.find(
      (pool) =>
        pool.algorithm === bestRate?.algorithm &&
        pool.liquidity.some(
          (liq) => liq.denom === this.amount[0].currency.coinMinimalDenom
        ) &&
        pool.liquidity.some(
          (liq) => liq.denom === this.outCurrency.coinMinimalDenom
        )
    );
  }

  private querySimulateSwap(
    min: CoinPretty
  ): ObservableQueryNobleSwapSimulateSwapInner | undefined {
    const nobleSwapSimulateSwap =
      this.pool &&
      this.queriesStore.get(this.chainId).noble?.querySwapSimulateSwap.getQuery(
        this.senderConfig.sender,
        this.amount[0].toCoin(),
        [
          {
            pool_id: this.pool.id,
            denom_to: this.outCurrency.coinMinimalDenom,
          },
        ],
        {
          denom: this.outCurrency.coinMinimalDenom,
          amount: min.toCoin().amount,
        }
      );

    return nobleSwapSimulateSwap;
  }

  get expectedOutAmount(): CoinPretty {
    if (this.amount[0].toDec().isZero()) {
      return new CoinPretty(this.outCurrency, "0");
    }

    const min = this.amount[0].mul(new Dec(0.99));
    const nobleSwapSimulateSwap = this.querySimulateSwap(min);

    const isLessThanMin =
      nobleSwapSimulateSwap?.error?.message.includes("min amount") ||
      nobleSwapSimulateSwap?.simulatedOutAmount?.toDec().lt(min.toDec());

    if (isLessThanMin) {
      return new CoinPretty(this.outCurrency, min.toCoin().amount);
    }

    if (nobleSwapSimulateSwap?.error) {
      return new CoinPretty(this.outCurrency, "0");
    }

    return (
      nobleSwapSimulateSwap?.simulatedOutAmount ??
      new CoinPretty(this.outCurrency, "0")
    );
  }

  get minOutAmount(): CoinPretty {
    return this.expectedOutAmount.mul(new Dec(1).sub(SLIPPAGE));
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

  const gasConfig = useGasConfig(chainGetter, chainId, 230000);
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
