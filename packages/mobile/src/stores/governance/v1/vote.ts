import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QuerySharedContext,
} from '@keplr-wallet/stores';
import {ProposalVoterV1} from './types';

export class ObservableQueryProposalVoteV1Inner extends ObservableChainQuery<ProposalVoterV1> {
  protected proposalId: string;
  protected bech32Address: string;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    proposalsId: string,
    bech32Address: string,
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/gov/v1/proposals/${proposalsId}/votes/${bech32Address}`,
    );
    this.proposalId = proposalsId;
    this.bech32Address = bech32Address;
  }

  get raw() {
    return this.response;
  }

  get vote(): 'Yes' | 'Abstain' | 'No' | 'NoWithVeto' | 'Unspecified' {
    if (!this.response || !this.response.data.vote.options) {
      return 'Unspecified';
    }

    switch (this.response.data.vote.options[0].option) {
      case 'VOTE_OPTION_YES':
        return 'Yes';
      case 'VOTE_OPTION_ABSTAIN':
        return 'Abstain';
      case 'VOTE_OPTION_NO':
        return 'No';
      case 'VOTE_OPTION_NO_WITH_VETO':
        return 'NoWithVeto';
      default:
        return 'Unspecified';
    }
  }

  refetch() {
    this.fetch();
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }
}

export class ObservableQueryProposalVoteV1 extends ObservableChainQueryMap<ProposalVoterV1> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) {
    super(sharedContext, chainId, chainGetter, (param: string) => {
      const {proposalId, voter} = JSON.parse(param);

      return new ObservableQueryProposalVoteV1Inner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        proposalId,
        voter,
      );
    });
  }

  getVote(
    proposalId: string,
    voter: string,
  ): ObservableQueryProposalVoteV1Inner {
    const param = JSON.stringify({
      proposalId,
      voter,
    });
    return this.get(param) as ObservableQueryProposalVoteV1Inner;
  }
}
