import {
  CosmosQueriesImpl,
  IQueriesStore,
  NobleQueries,
  OsmosisQueries,
} from "@keplr-wallet/stores";
import { KeplrETCQueriesImpl } from "@keplr-wallet/stores-etc";
import { EthereumQueries } from "@keplr-wallet/stores-eth";

export type QueriesStore = IQueriesStore<
  Partial<OsmosisQueries> &
    Partial<EthereumQueries> & {
      cosmos?: Pick<
        CosmosQueriesImpl,
        | "queryDelegations"
        | "queryFeeMarketGasPrices"
        | "queryEvmFeeMarketBaseFee"
      >;
    } & {
      keplrETC?: Pick<
        KeplrETCQueriesImpl,
        | "queryTerraClassicTaxRate"
        | "queryTerraClassicTaxCaps"
        | "queryInitiaDynamicFee"
      >;
    } & Partial<NobleQueries>
>;
