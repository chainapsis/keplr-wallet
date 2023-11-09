import {
  ChainGetter,
  ObservableQueryStakingPool,
  QueriesSetBase,
  QuerySharedContext,
} from '@keplr-wallet/stores';
import {DeepReadonly} from 'utility-types';
import {ObservableQueryGovernance} from './proposals';

export interface CosmosGovernanceQueries {
  governance: CosmosGovernanceQueriesImpl;
}

export const CosmosGovernanceQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) => CosmosGovernanceQueries {
    return (
      _: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter,
    ) => {
      return {
        governance: new CosmosGovernanceQueriesImpl(
          sharedContext,
          chainId,
          chainGetter,
        ),
      };
    };
  },
};

export class CosmosGovernanceQueriesImpl {
  public readonly queryGovernance: DeepReadonly<ObservableQueryGovernance>;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) {
    this.queryGovernance = new ObservableQueryGovernance(
      sharedContext,
      chainId,
      chainGetter,
      new ObservableQueryStakingPool(sharedContext, chainId, chainGetter),
    );
  }
}
