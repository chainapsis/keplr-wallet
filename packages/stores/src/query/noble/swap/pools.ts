import { ObservableChainQuery } from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";
import { NobleSwapPool } from "./types";

export class ObservableQueryNobleSwapPools extends ObservableChainQuery<{
  pools: NobleSwapPool[];
}> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, `/noble/swap/v1/pools`);

    makeObservable(this);
  }

  @computed
  get pools(): NobleSwapPool[] {
    return this.response?.data.pools ?? [];
  }
}
