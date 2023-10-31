import {
  CosmosQueriesImpl,
  CosmwasmQueriesImpl,
  EvmQueriesImpl,
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
  } & {
    evm?: Pick<
      EvmQueriesImpl,
      "queryEthGasFees" | "queryNativeFetBridge" | "queryGasPrice"
    >;
  } & {
    cosmwasm?: Pick<CosmwasmQueriesImpl, "queryNativeFetBridge">;
  }
>;
