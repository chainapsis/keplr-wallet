import { KVStore } from "../../../../common/kvstore";
import { ObservableChainQuery, ObservableChainQueryMap } from "./chain-query";
import { ChainGetter } from "./index";

export interface DenomTractResponse {
  denom_trace: {
    path: string;
    base_denom: string;
  };
}

export class ObservableQueryDenomTrace extends ObservableChainQueryMap<
  DenomTractResponse
> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (hash: string) => {
      return new ObservableChainQuery<DenomTractResponse>(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        `/ibc/applications/transfer/v1beta1/denom_traces/${hash}`
      );
    });
  }

  getDenomTrace(hash: string): ObservableChainQuery<DenomTractResponse> {
    return this.get(hash);
  }
}
