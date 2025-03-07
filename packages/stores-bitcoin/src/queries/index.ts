import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryBitcoinBalance } from "./balance";
import { ObservableQueryBitcoinFeeEstimates } from "./fee-estimates";
import { ObservableQueryBitcoinUTXOs } from "./utxos";
import { ObservableQueryBitcoinTx } from "./tx";

export class BitcoinQueriesStore {
  protected map: Map<string, BitcoinQueriesStoreImpl> = new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter
  ) {}

  public get(chainId: string): DeepReadonly<BitcoinQueriesStoreImpl> {
    const prior = this.map.get(chainId);
    if (prior) {
      return prior;
    }

    const store = new BitcoinQueriesStoreImpl(
      this.sharedContext,
      chainId,
      this.chainGetter
    );
    this.map.set(chainId, store);

    return store;
  }
}

class BitcoinQueriesStoreImpl {
  public readonly queryBitcoinBalance: DeepReadonly<ObservableQueryBitcoinBalance>;
  public readonly queryBitcoinUTXOs: DeepReadonly<ObservableQueryBitcoinUTXOs>;
  public readonly queryBitcoinTx: DeepReadonly<ObservableQueryBitcoinTx>;
  public readonly queryBitcoinFeeEstimates: DeepReadonly<ObservableQueryBitcoinFeeEstimates>;

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    this.queryBitcoinBalance = new ObservableQueryBitcoinBalance(sharedContext);
    this.queryBitcoinUTXOs = new ObservableQueryBitcoinUTXOs(sharedContext);
    this.queryBitcoinTx = new ObservableQueryBitcoinTx(sharedContext);
    this.queryBitcoinFeeEstimates = new ObservableQueryBitcoinFeeEstimates(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
