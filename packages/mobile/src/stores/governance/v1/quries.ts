import {
  ChainGetter,
  ObservableQueryStakingPool,
  QueriesSetBase,
  QuerySharedContext,
} from '@keplr-wallet/stores';
import {DeepReadonly} from 'utility-types';
import {ObservableQueryGovernanceV1} from './proposals';

export interface CosmosGovernanceQueriesV1 {
  governanceV1: CosmosGovernanceQueriesImpl;
}

export const CosmosGovernanceQueriesV1 = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) => CosmosGovernanceQueriesV1 {
    return (
      _: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter,
    ) => {
      return {
        governanceV1: new CosmosGovernanceQueriesImpl(
          sharedContext,
          chainId,
          chainGetter,
        ),
      };
    };
  },
};

export class CosmosGovernanceQueriesImpl {
  public readonly queryGovernance: DeepReadonly<ObservableQueryGovernanceV1>;
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) {
    //실행할때 뭔 돌리고 그뒤에서 다시 넣으면 안되나?
    this.queryGovernance = new ObservableQueryGovernanceV1(
      sharedContext,
      chainId,
      chainGetter,
      new ObservableQueryStakingPool(sharedContext, chainId, chainGetter),
    );
  }
}
