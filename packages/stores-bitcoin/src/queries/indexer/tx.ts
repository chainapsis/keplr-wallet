import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { ObservableBitcoinIndexerQuery } from "../bitcoin-indexer";
import { makeObservable } from "mobx";
import { Transaction } from "bitcoinjs-lib";

export class ObservableQueryBitcoinTxImpl extends ObservableBitcoinIndexerQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly txid: string
  ) {
    super(sharedContext, chainId, chainGetter, `tx/${txid}/hex`);

    makeObservable(this);
  }

  get txHex(): string | undefined {
    return this.response?.data;
  }

  get tx(): Transaction | undefined {
    if (!this.txHex) {
      return;
    }

    return Transaction.fromHex(this.txHex);
  }
}

export class ObservableQueryBitcoinTx {
  protected map: Map<string, ObservableQueryBitcoinTxImpl> = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getTx(
    chainId: string,
    chainGetter: ChainGetter,
    txid: string
  ): ObservableQueryBitcoinTxImpl | undefined {
    const key = `${chainId}/${txid}`;
    const prior = this.map.get(key);
    if (prior) {
      return prior;
    }

    const modularChainInfo = chainGetter.getModularChain(chainId);
    if (!("bitcoin" in modularChainInfo)) {
      return;
    }

    const impl = new ObservableQueryBitcoinTxImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      txid
    );

    this.map.set(key, impl);

    return impl;
  }
}
