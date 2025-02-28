import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { UTXO } from "./types";
import { ObservableBitcoinIndexerQuery } from "./bitcoin-indexer";
import { makeObservable } from "mobx";

export class ObservableQueryBitcoinUTXOsImpl extends ObservableBitcoinIndexerQuery<
  UTXO[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly address: string
  ) {
    super(sharedContext, chainId, chainGetter, `address/${address}/utxos`);

    makeObservable(this);
  }

  get utxos(): UTXO[] | undefined {
    return this.response?.data;
  }
}

export class ObservableQueryBitcoinUTXOs {
  protected map: Map<string, ObservableQueryBitcoinUTXOsImpl> = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getUTXOs(
    chainId: string,
    chainGetter: ChainGetter,
    address: string
  ): ObservableQueryBitcoinUTXOsImpl | undefined {
    const key = `${chainId}/${address}`;
    const prior = this.map.get(key);
    if (prior) {
      return prior;
    }

    const modularChainInfo = chainGetter.getModularChain(chainId);
    if (!("bitcoin" in modularChainInfo)) {
      return;
    }

    const impl = new ObservableQueryBitcoinUTXOsImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      address
    );

    this.map.set(key, impl);

    return impl;
  }
}
