import {
  CosmosQueriesImpl,
  IQueriesStore,
  OsmosisQueries,
} from "@keplr-wallet/stores";

export type QueriesStore = IQueriesStore<
  Partial<OsmosisQueries> & {
    cosmos?: Pick<CosmosQueriesImpl, "queryDelegations">;
  }
>;
