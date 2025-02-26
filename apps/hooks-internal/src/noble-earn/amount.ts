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

// Slippage is 0.1% referred from Osmosis
const SLIPPAGE = new Dec(0.001);

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
    const pool = pools?.find(
      (pool) =>
        pool.algorithm === bestRate?.algorithm &&
        pool.liquidity.some(
          (liq) => liq.denom === this.amount[0].currency.coinMinimalDenom
        ) &&
        pool.liquidity.some(
          (liq) => liq.denom === this.outCurrency.coinMinimalDenom
        )
    );

    const nobleSwapSimulateSwap =
      pool &&
      this.queriesStore.get(this.chainId).noble?.querySwapSimulateSwap.getQuery(
        this.senderConfig.sender,
        this.amount[0].toCoin(),
        [
          {
            pool_id: pool.id,
            denom_to: this.outCurrency.coinMinimalDenom,
          },
        ],
        {
          denom: this.outCurrency.coinMinimalDenom,
          // XXX: zero amount is okay just for simulation
          amount: "0",
        }
      );

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
