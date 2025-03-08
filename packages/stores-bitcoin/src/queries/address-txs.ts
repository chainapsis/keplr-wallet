import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { ObservableBitcoinIndexerQuery } from "./bitcoin-indexer";
import { makeObservable } from "mobx";
import { BitcoinTx } from "./types";

export class ObservableQueryBitcoinAddressTxsImpl extends ObservableBitcoinIndexerQuery<
  BitcoinTx[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly address: string
  ) {
    super(sharedContext, chainId, chainGetter, `address/${address}/txs`);

    makeObservable(this);
  }

  // get latest 50 txs for checking spent utxos
  // CHECK: might needs to be updated to get more txs with pagination to display history in the UI
  get txs(): BitcoinTx[] | undefined {
    return this.response?.data;
  }
}

export class ObservableQueryBitcoinAddressTxs {
  protected map: Map<string, ObservableQueryBitcoinAddressTxsImpl> = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getTxs(
    chainId: string,
    chainGetter: ChainGetter,
    address: string
  ): ObservableQueryBitcoinAddressTxsImpl | undefined {
    const key = `${chainId}/${address}`;
    const prior = this.map.get(key);
    if (prior) {
      return prior;
    }

    const modularChainInfo = chainGetter.getModularChain(chainId);
    if (!("bitcoin" in modularChainInfo)) {
      return;
    }

    const impl = new ObservableQueryBitcoinAddressTxsImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      address
    );

    this.map.set(key, impl);

    return impl;
  }
}
