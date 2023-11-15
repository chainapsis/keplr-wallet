import {
  ChainGetter,
  ObservableQueryStakingPool,
  QueriesSetBase,
  QuerySharedContext,
} from '@keplr-wallet/stores';
import {DeepReadonly} from 'utility-types';
import {ObservableQueryGovernance} from './proposals';
import {ObservableQueryProposalVote} from './vote';

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
  public readonly queryVotes: DeepReadonly<ObservableQueryProposalVote>;

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

    this.queryVotes = new ObservableQueryProposalVote(
      sharedContext,
      chainId,
      chainGetter,
    );
  }
}
