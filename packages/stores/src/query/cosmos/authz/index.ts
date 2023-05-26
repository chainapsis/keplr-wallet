import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { Granter } from "./types";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryAuthZGranterInner extends ObservableChainQuery<Granter> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly granter: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/authz/v1beta1/grants/granter/${granter}?pagination.limit=1000`
    );
  }

  protected override canFetch(): boolean {
    return this.granter.length > 0;
  }
}

export class ObservableQueryAuthZGranter extends ObservableChainQueryMap<Granter> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (granter) => {
      return new ObservableQueryAuthZGranterInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        granter
      );
    });
  }

  getGranter(granter: string): ObservableQueryAuthZGranterInner {
    return this.get(granter) as ObservableQueryAuthZGranterInner;
  }
}
