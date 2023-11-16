import {ProposalTallyV1, ProposalV1} from './types';
import {makeObservable} from 'mobx';
import {DeepReadonly} from 'utility-types';
import {ObservableQueryGovernanceV1Inner} from './proposals';
import {
  ChainGetter,
  ObservableChainQuery,
  QuerySharedContext,
} from '@keplr-wallet/stores';
import {ProposalStatus} from '../types';

export class ObservableQueryProposalV1 extends ObservableChainQuery<ProposalTallyV1> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _raw: ProposalV1,
    protected readonly governance: ObservableQueryGovernanceV1Inner,
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/gov/v1/proposals/${_raw.id}/tally`,
    );
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return this.proposalStatus === ProposalStatus.VOTING_PERIOD;
  }

  get raw(): DeepReadonly<ProposalV1> {
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
    return this.raw.id;
  }

  get title(): string {
    if (this.raw.title) {
      return this.raw.title;
    }

    if (this.raw.messages.length === 0) {
      if (this.raw.metadata) {
        try {
          const metadata = JSON.parse(this.raw.metadata);
          if (metadata.title) {
            return metadata.title;
          }
        } catch (e) {
          console.log(e);
          // noop
        }
      }

      return 'No Title';
    }

    if (this.raw.messages[0].content?.title) {
      return this.raw.messages[0].content.title;
    }

    if (this.raw.messages[0]['@type']) {
      return this.raw.messages[0]['@type'];
    }

    if (this.raw.messages[0].content && this.raw.messages[0].content['@type']) {
      return this.raw.messages[0].content['@type'];
    }

    return '';
  }

  get description(): string {
    if (this.raw.summary) {
      return this.raw.summary;
    }

    if (this.raw.messages.length === 0) {
      if (this.raw.metadata) {
        try {
          const metadata = JSON.parse(this.raw.metadata);
          if (metadata.summary) {
            return metadata.summary;
          }
        } catch (e) {
          console.log(e);
          // noop
        }
      }

      return 'Unknown';
    }

    if (this.raw.messages[0].content?.description) {
      return this.raw.messages[0].content.description;
    }

    return JSON.stringify(this.raw.messages[0], null, 2);
  }
}
