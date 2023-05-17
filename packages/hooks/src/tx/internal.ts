import {
  CosmosQueriesImpl,
  IQueriesStore,
  OsmosisQueries,
} from "@keplr-wallet/stores";
import { KeplrETCQueriesImpl } from "@keplr-wallet/stores-etc";

export type QueriesStore = IQueriesStore<
  Partial<OsmosisQueries> & {
    cosmos?: Pick<CosmosQueriesImpl, "queryDelegations">;
  } & {
    keplrETC?: Pick<
      KeplrETCQueriesImpl,
      "queryTerraClassicTaxRate" | "queryTerraClassicTaxCaps"
    >;
  }
>;
