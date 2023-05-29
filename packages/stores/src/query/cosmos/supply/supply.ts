import { SupplyTotal } from "./types";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { QuerySharedContext } from "../../../common";

export class ObservableChainQuerySupplyTotal extends ObservableChainQuery<SupplyTotal> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denom: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/bank/v1beta1/supply/${denom}`
    );
  }
}

export class ObservableQuerySupplyTotal extends ObservableChainQueryMap<SupplyTotal> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (denom: string) => {
      return new ObservableChainQuerySupplyTotal(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  getQueryDenom(denom: string): ObservableChainQuerySupplyTotal {
    return this.get(denom);
  }

  // cosmos-sdk v0.46.0+ has changed the API to use query string.
  getQueryDenomByQueryString(denom: string): ObservableChainQuerySupplyTotal {
    return this.get(`by_denom?denom=${denom}`);
  }

  getQueryStakeDenom(): ObservableChainQuerySupplyTotal {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return this.get(chainInfo.stakeCurrency.coinMinimalDenom);
  }
}
