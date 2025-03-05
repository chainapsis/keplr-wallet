import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";
import { NobleYield } from "./types";

export class ObservableQueryNobleYieldInner extends ObservableChainQuery<NobleYield> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/noble/dollar/v1/yield/${bech32Address}`
    );

    makeObservable(this);
  }

  @computed
  get claimableAmount(): string {
    if (!this.response || !this.response.data.claimable_amount) {
      return "0";
    }
    return this.response.data.claimable_amount;
  }
}
export class ObservableQueryNobleYield extends ObservableChainQueryMap<NobleYield> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryNobleYieldInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(bech32Address: string): ObservableQueryNobleYieldInner {
    return this.get(bech32Address) as ObservableQueryNobleYieldInner;
  }
}
