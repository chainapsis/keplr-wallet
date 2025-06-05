import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { ObservableQueryAccount } from "./account";
import {
  ObservableQueryBabylonBtcDelegationReward,
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
import { ObservableQueryIBCClientStateV2 } from "./ibc/client-state-v2";
import { ObservableQueryInitiaUnbondingDelegations } from "./staking/initia-unbonding-delegations";
import { ObservableQueryInitiaDelegations } from "./staking/initia-delegations";
import { ObservableQueryInitiaValidators } from "./staking/initia-validators";

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
  public readonly queryInitiaDelegations: DeepReadonly<ObservableQueryInitiaDelegations>;
  public readonly queryUnbondingDelegations: DeepReadonly<ObservableQueryUnbondingDelegations>;
  public readonly queryInitiaUnbondingDelegations: DeepReadonly<ObservableQueryInitiaUnbondingDelegations>;
  public readonly queryValidators: DeepReadonly<ObservableQueryValidators>;
  public readonly queryBabylonBtcDelegationReward: DeepReadonly<ObservableQueryBabylonBtcDelegationReward>;
  public readonly queryInitiaValidators: DeepReadonly<ObservableQueryInitiaValidators>;

  public readonly queryIBCClientState: DeepReadonly<ObservableQueryIBCClientState>;
  public readonly queryIBCClientStateV2: DeepReadonly<ObservableQueryIBCClientStateV2>;
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
    this.queryInitiaDelegations = new ObservableQueryInitiaDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryUnbondingDelegations = new ObservableQueryUnbondingDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryInitiaUnbondingDelegations =
      new ObservableQueryInitiaUnbondingDelegations(
        sharedContext,
        chainId,
        chainGetter
      );
    this.queryValidators = new ObservableQueryValidators(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryBabylonBtcDelegationReward =
      new ObservableQueryBabylonBtcDelegationReward(
        sharedContext,
        chainId,
        chainGetter
      );

    this.queryInitiaValidators = new ObservableQueryInitiaValidators(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCClientState = new ObservableQueryIBCClientState(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCClientStateV2 = new ObservableQueryIBCClientStateV2(
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
