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
  ObservableQueryStakingPool,
  QuerySharedContext,
} from '@keplr-wallet/stores';

export class ObservableQueryGovernanceV1 extends ObservableChainQuery<GovV1Proposals> {
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
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      // TODO: Handle pagination
      '/cosmos/gov/v1/proposals?pagination.limit=3000',
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
  get proposals(): DeepReadonly<ObservableQueryProposalV1[]> {
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

    return result.reverse();
  }

  readonly getProposal = computedFn(
    (id: string): DeepReadonly<ObservableQueryProposalV1> | undefined => {
      return this.proposals.find(proposal => proposal.id === id);
    },
  );
}
