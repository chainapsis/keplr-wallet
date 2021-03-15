import { KVStore } from "@keplr-wallet/common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../common";
import { DenomTractResponse } from "./types";

export class ObservableQueryDenomTrace extends ObservableChainQueryMap<DenomTractResponse> {
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
