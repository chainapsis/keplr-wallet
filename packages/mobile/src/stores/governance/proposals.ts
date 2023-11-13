import {GovProposals, GovQueryParams, ViewProposal} from './types';
import {computed, makeObservable, observable, runInAction} from 'mobx';
import {
  ObservableQueryGovParamDeposit,
  ObservableQueryGovParamTally,
  ObservableQueryGovParamVoting,
} from './params';
import {DeepReadonly} from 'utility-types';
import {Dec, DecUtils, Int, IntPretty} from '@keplr-wallet/unit';
import {computedFn} from 'mobx-utils';
import {ObservableQueryProposal} from './proposal';
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  ObservableQueryStakingPool,
  QuerySharedContext,
} from '@keplr-wallet/stores';

export class ObservableQueryGovernance extends ObservableChainQueryMap<GovProposals> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _queryPool: ObservableQueryStakingPool,
  ) {
    super(sharedContext, chainId, chainGetter, (params?: string) => {
      return new ObservableQueryGovernanceInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        _queryPool,
        params,
      );
    });
  }
  getQueryGovernance(params?: GovQueryParams): ObservableQueryGovernanceInner {
    const queryParams = params
      ? Object.entries(params)
          .map(([key, value]) => {
            if (key === 'status') {
              if (value === 'PROPOSAL_STATUS_UNSPECIFIED') {
                return 'proposal_status=0';
              }
              if (value === 'PROPOSAL_STATUS_DEPOSIT_PERIOD') {
                return 'proposal_status=1';
              }
              if (value === 'PROPOSAL_STATUS_VOTING_PERIOD') {
                return 'proposal_status=2';
              }
              if (value === 'PROPOSAL_STATUS_PASSED') {
                return 'proposal_status=3';
              }
              if (value === 'PROPOSAL_STATUS_REJECTED') {
                return 'proposal_status=4';
              }
              if (value === 'PROPOSAL_STATUS_FAILED') {
                return 'proposal_status=5';
              }
            }
          })
          .join('&')
      : '';
    return this.get(queryParams) as ObservableQueryGovernanceInner;
  }
}

export class ObservableQueryGovernanceInner extends ObservableChainQuery<GovProposals> {
  @observable.ref
  protected paramDeposit?: ObservableQueryGovParamDeposit = undefined;
  @observable.ref
  protected paramVoting?: ObservableQueryGovParamVoting = undefined;
  @observable.ref
  protected paramTally?: ObservableQueryGovParamTally = undefined;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _queryPool: ObservableQueryStakingPool,
    params?: string,
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      // TODO: Handle pagination
      `/cosmos/gov/v1beta1/proposals?pagination.limit=3000&${params}`,
    );
    makeObservable(this);
  }

  getQueryPool(): DeepReadonly<ObservableQueryStakingPool> {
    return this._queryPool;
  }

  getQueryParamDeposit(): DeepReadonly<ObservableQueryGovParamDeposit> {
    if (!this.paramDeposit) {
      runInAction(() => {
        this.paramDeposit = new ObservableQueryGovParamDeposit(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramDeposit!;
  }

  getQueryParamVoting(): DeepReadonly<ObservableQueryGovParamVoting> {
    if (!this.paramVoting) {
      runInAction(() => {
        this.paramVoting = new ObservableQueryGovParamVoting(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramVoting!;
  }

  getQueryParamTally(): DeepReadonly<ObservableQueryGovParamTally> {
    if (!this.paramTally) {
      runInAction(() => {
        this.paramTally = new ObservableQueryGovParamTally(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramTally!;
  }

  @computed
  get quorum(): IntPretty {
    const paramTally = this.getQueryParamTally();
    if (!paramTally.response) {
      return new IntPretty(new Int(0)).ready(false);
    }

    // TODO: Use `RatePretty`
    let quorum = new Dec(paramTally.response.data.tally_params.quorum);
    // Multiply 100
    quorum = quorum.mulTruncate(DecUtils.getPrecisionDec(2));

    return new IntPretty(quorum);
  }

  @computed
  get proposals(): ViewProposal[] {
    if (!this.response) {
      return [];
    }

    const result: ObservableQueryProposal[] = [];

    for (const raw of this.response.data.proposals) {
      result.push(
        new ObservableQueryProposal(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
          raw,
          this,
        ),
      );
    }

    return result.reverse().map(proposal => {
      return {
        raw: proposal.raw,
        proposalStatus: proposal.proposalStatus,
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
      };
    });
  }

  readonly getProposal = computedFn((id: string): ViewProposal | undefined => {
    return this.proposals.find(proposal => proposal.id === id);
  });
}
