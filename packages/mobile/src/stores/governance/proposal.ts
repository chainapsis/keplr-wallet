import {Proposal, ProposalStatus, ProposalTally} from './types';
import {makeObservable} from 'mobx';
import {DeepReadonly} from 'utility-types';
import {ObservableQueryGovernance} from './proposals';
import {
  ChainGetter,
  ObservableChainQuery,
  QuerySharedContext,
} from '@keplr-wallet/stores';

export class ObservableQueryProposal extends ObservableChainQuery<ProposalTally> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _raw: Proposal,
    protected readonly governance: ObservableQueryGovernance,
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/gov/v1beta1/proposals/${_raw.proposal_id}/tally`,
    );
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return this.proposalStatus === ProposalStatus.VOTING_PERIOD;
  }

  get raw(): DeepReadonly<Proposal> {
    return this._raw;
  }

  get proposalStatus(): ProposalStatus {
    switch (this.raw.status) {
      case 'PROPOSAL_STATUS_DEPOSIT_PERIOD':
        return ProposalStatus.DEPOSIT_PERIOD;
      case 'PROPOSAL_STATUS_VOTING_PERIOD':
        return ProposalStatus.VOTING_PERIOD;
      case 'PROPOSAL_STATUS_PASSED':
        return ProposalStatus.PASSED;
      case 'PROPOSAL_STATUS_REJECTED':
        return ProposalStatus.REJECTED;
      case 'PROPOSAL_STATUS_FAILED':
        return ProposalStatus.FAILED;
      default:
        return ProposalStatus.UNSPECIFIED;
    }
  }

  get id(): string {
    return this.raw.proposal_id;
  }

  get title(): string {
    return this.raw.content.title;
  }

  get description(): string {
    return this.raw.content.description;
  }
}
