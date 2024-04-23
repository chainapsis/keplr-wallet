import {GovV1Proposals} from './types';
import {computed, makeObservable, observable, runInAction} from 'mobx';
import {
  ObservableQueryGovV1ParamDeposit,
  ObservableQueryGovV1ParamTally,
  ObservableQueryGovV1ParamVoting,
} from './params';
import {DeepReadonly} from 'utility-types';
import {Dec, DecUtils, Int, IntPretty} from '@keplr-wallet/unit';
import {computedFn} from 'mobx-utils';
import {ObservableQueryProposalV1} from './proposal';
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  ObservableQueryStakingPool,
  QuerySharedContext,
} from '@keplr-wallet/stores';
import {GovQueryParams, ViewProposal} from '../types';

export class ObservableQueryGovernanceV1 extends ObservableChainQueryMap<GovV1Proposals> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _queryPool: ObservableQueryStakingPool,
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      // TODO: Handle pagination
      (params?: string) => {
        return new ObservableQueryGovernanceV1Inner(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
          _queryPool,
          params,
        );
      },
    );
    makeObservable(this);
  }
  getQueryGovernance(
    params?: GovQueryParams,
  ): ObservableQueryGovernanceV1Inner {
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
            return `${key}=${value}`;
          })
          .join('&')
      : '';
    return this.get(queryParams) as ObservableQueryGovernanceV1Inner;
  }

  //TODO 이방식으로 하면 거버넌스 쿼리는 사용안 하는 description도 가져와서
  //용량이 너무 커지는 문제가 있음 해서 나중에 거버넌스만 캐싱을 하지 않는 로직을 추가해야함
  getQueryGovernanceWithPage(params: {page: number; perPageNumber: number}): {
    firstFetching?: boolean;
    proposals: ViewProposal[];
  } {
    const list = Array.from({length: params.page + 1}, (_, i) => {
      return `pagination.offset=${
        i * 20
      }&pagination.reverse=true&pagination.limit=${params.perPageNumber}`;
    });

    return {
      firstFetching: (this.get(list[0]) as ObservableQueryGovernanceV1Inner)
        .isFetching,
      proposals: [
        ...list.flatMap(param => {
          return (
            this.get(param) as ObservableQueryGovernanceV1Inner
          ).proposals.sort((a, b) => Number(b.id) - Number(a.id));
        }),
      ],
    };
  }
}

export class ObservableQueryGovernanceV1Inner extends ObservableChainQuery<GovV1Proposals> {
  @observable.ref
  protected paramDeposit?: ObservableQueryGovV1ParamDeposit = undefined;
  @observable.ref
  protected paramVoting?: ObservableQueryGovV1ParamVoting = undefined;
  @observable.ref
  protected paramTally?: ObservableQueryGovV1ParamTally = undefined;

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
      `/cosmos/gov/v1/proposals?${params}`,
    );
    makeObservable(this);
  }

  getQueryPool(): DeepReadonly<ObservableQueryStakingPool> {
    return this._queryPool;
  }

  getQueryParamDeposit(): DeepReadonly<ObservableQueryGovV1ParamDeposit> {
    if (!this.paramDeposit) {
      runInAction(() => {
        this.paramDeposit = new ObservableQueryGovV1ParamDeposit(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramDeposit!;
  }

  getQueryParamVoting(): DeepReadonly<ObservableQueryGovV1ParamVoting> {
    if (!this.paramVoting) {
      runInAction(() => {
        this.paramVoting = new ObservableQueryGovV1ParamVoting(
          this.sharedContext,
          this.chainId,
          this.chainGetter,
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramVoting!;
  }

  getQueryParamTally(): DeepReadonly<ObservableQueryGovV1ParamTally> {
    if (!this.paramTally) {
      runInAction(() => {
        this.paramTally = new ObservableQueryGovV1ParamTally(
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

    const result: ObservableQueryProposalV1[] = [];

    for (const raw of this.response.data.proposals) {
      result.push(
        new ObservableQueryProposalV1(
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
