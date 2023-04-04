import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { Granter } from "./types";

export class ObservableQueryAuthZGranterInner extends ObservableChainQuery<Granter> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly granter: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/authz/v1beta1/grants/granter/${granter}?pagination.limit=1000`
    );
  }

  protected canFetch(): boolean {
    return this.granter.length > 0;
  }
}

export class ObservableQueryAuthZGranter extends ObservableChainQueryMap<Granter> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (granter) => {
      return new ObservableQueryAuthZGranterInner(
        this.kvStore,
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
