import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { DeepReadonly } from "utility-types";
import { ObservableQueryTxFeesFeeTokens } from "./txfees/fee-tokens";
import { ObservableQueryTxFeesSpotPriceByDenom } from "./txfees/spot-price-by-denom";
import { ObservableQueryTxFeesBaseDenom } from "./txfees/base-denom";
import { QuerySharedContext } from "../../common";
import { ObservableQueryBaseFee } from "./base-fee";

export interface OsmosisQueries {
  osmosis: OsmosisQueriesImpl;
}

export const OsmosisQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => OsmosisQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        osmosis: new OsmosisQueriesImpl(
          queriesSetBase,
          sharedContext,
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

  public readonly queryBaseFee: DeepReadonly<ObservableQueryBaseFee>;

  constructor(
    _: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryTxFeesFeeTokens = new ObservableQueryTxFeesFeeTokens(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryTxFeesSpotPriceByDenom =
      new ObservableQueryTxFeesSpotPriceByDenom(
        sharedContext,
        chainId,
        chainGetter
      );
    this.queryTxFeesBaseDenom = new ObservableQueryTxFeesBaseDenom(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryBaseFee = new ObservableQueryBaseFee(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
