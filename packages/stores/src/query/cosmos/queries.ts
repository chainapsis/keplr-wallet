import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { ObservableQueryAccount } from "./account";
import {
  ObservableQueryDelegations,
  ObservableQueryRewards,
  ObservableQueryStakingParams,
  ObservableQueryStakingPool,
  ObservableQueryUnbondingDelegations,
  ObservableQueryValidators,
} from "./staking";
import {
  ObservableQueryDenomTrace,
  ObservableQueryIBCChannel,
  ObservableQueryIBCClientState,
} from "./ibc";
import {
  ObservableQueryCosmosBalanceRegistry,
  ObservableQuerySpendableBalances,
} from "./balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryDistributionParams } from "./distribution";
import { ObservableQueryRPCStatus } from "./status";
import { ObservableQueryAuthZGranter } from "./authz";
import { QuerySharedContext } from "../../common";
import { ObservableQueryFeeMarketGasPrices } from "./feemarket";

export interface CosmosQueries {
  cosmos: CosmosQueriesImpl;
}

export const CosmosQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => CosmosQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        cosmos: new CosmosQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class CosmosQueriesImpl {
  public readonly queryRPCStatus: DeepReadonly<ObservableQueryRPCStatus>;

  public readonly queryAccount: DeepReadonly<ObservableQueryAccount>;
  public readonly querySpendableBalances: DeepReadonly<ObservableQuerySpendableBalances>;
  public readonly queryPool: DeepReadonly<ObservableQueryStakingPool>;
  public readonly queryStakingParams: DeepReadonly<ObservableQueryStakingParams>;
  public readonly queryDistributionParams: DeepReadonly<ObservableQueryDistributionParams>;
  public readonly queryRewards: DeepReadonly<ObservableQueryRewards>;
  public readonly queryDelegations: DeepReadonly<ObservableQueryDelegations>;
  public readonly queryUnbondingDelegations: DeepReadonly<ObservableQueryUnbondingDelegations>;
  public readonly queryValidators: DeepReadonly<ObservableQueryValidators>;

  public readonly queryIBCClientState: DeepReadonly<ObservableQueryIBCClientState>;
  public readonly queryIBCChannel: DeepReadonly<ObservableQueryIBCChannel>;
  public readonly queryIBCDenomTrace: DeepReadonly<ObservableQueryDenomTrace>;

  public readonly queryAuthZGranter: DeepReadonly<ObservableQueryAuthZGranter>;

  public readonly queryFeeMarketGasPrices: DeepReadonly<ObservableQueryFeeMarketGasPrices>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryRPCStatus = new ObservableQueryRPCStatus(
      sharedContext,
      chainId,
      chainGetter
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQueryCosmosBalanceRegistry(sharedContext)
    );

    this.queryAccount = new ObservableQueryAccount(
      sharedContext,
      chainId,
      chainGetter
    );
    this.querySpendableBalances = new ObservableQuerySpendableBalances(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryPool = new ObservableQueryStakingPool(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryStakingParams = new ObservableQueryStakingParams(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryDistributionParams = new ObservableQueryDistributionParams(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryRewards = new ObservableQueryRewards(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryDelegations = new ObservableQueryDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryUnbondingDelegations = new ObservableQueryUnbondingDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryValidators = new ObservableQueryValidators(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryIBCClientState = new ObservableQueryIBCClientState(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCChannel = new ObservableQueryIBCChannel(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCDenomTrace = new ObservableQueryDenomTrace(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryAuthZGranter = new ObservableQueryAuthZGranter(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryFeeMarketGasPrices = new ObservableQueryFeeMarketGasPrices(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
