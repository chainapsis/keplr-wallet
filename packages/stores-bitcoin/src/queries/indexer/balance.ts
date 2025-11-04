import {
  ChainGetter,
  IObservableQueryBalanceImpl,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { DenomHelper } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ObservableBitcoinIndexerQuery } from "../bitcoin-indexer";
import { AddressDetails } from "../types";

export class ObservableQueryBitcoinBalanceImpl
  extends ObservableBitcoinIndexerQuery<AddressDetails>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly address: string
  ) {
    super(sharedContext, chainId, chainGetter, `address/${address}`);

    makeObservable(this);
  }

  /**
   * balance is the sum of confirmed balances.
   */
  @computed
  get balance(): CoinPretty {
    if (!this.response || !this.response.data) {
      return new CoinPretty(this.currency, new Dec(0));
    }

    const data = this.response.data;
    return new CoinPretty(
      this.currency,
      new Dec(data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum)
    );
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("bitcoin" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not bitcoin chain`);
    }

    const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    );

    const currencies = modularChainInfoImpl.getCurrenciesByModule("bitcoin");
    const currency = currencies.find((cur) => cur.coinMinimalDenom === denom);

    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    return currency;
  }
}

export class ObservableQueryBitcoinBalance {
  protected map: Map<string, ObservableQueryBitcoinBalanceImpl> = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalance(
    chainId: string,
    chainGetter: ChainGetter,
    address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const key = `${chainId}/${address}/${minimalDenom}`;
    const prior = this.map.get(key);
    if (prior) {
      return prior;
    }

    const denomHelper = new DenomHelper(minimalDenom);
    const modularChainInfo = chainGetter.getModularChain(chainId);
    if (!("bitcoin" in modularChainInfo)) {
      return;
    }

    const impl = new ObservableQueryBitcoinBalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      address
    );
    this.map.set(key, impl);
    return impl;
  }
}
