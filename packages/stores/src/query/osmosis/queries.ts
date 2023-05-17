import { QueriesSetBase } from "../queries";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryTxFeesFeeTokens } from "./txfees/fee-tokens";
import { ObservableQueryTxFeesSpotPriceByDenom } from "./txfees/spot-price-by-denom";
import { ObservableQueryTxFeesBaseDenom } from "./txfees/base-denom";

export interface OsmosisQueries {
  osmosis: OsmosisQueriesImpl;
}

export const OsmosisQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => OsmosisQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        osmosis: new OsmosisQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class OsmosisQueriesImpl {
  public readonly queryTxFeesFeeTokens: DeepReadonly<ObservableQueryTxFeesFeeTokens>;
  public readonly queryTxFeesSpotPriceByDenom: DeepReadonly<ObservableQueryTxFeesSpotPriceByDenom>;
  public readonly queryTxFeesBaseDenom: DeepReadonly<ObservableQueryTxFeesBaseDenom>;

  constructor(
    _: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryTxFeesFeeTokens = new ObservableQueryTxFeesFeeTokens(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryTxFeesSpotPriceByDenom = new ObservableQueryTxFeesSpotPriceByDenom(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryTxFeesBaseDenom = new ObservableQueryTxFeesBaseDenom(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
