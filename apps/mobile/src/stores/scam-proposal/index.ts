import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {ObservableQuery, QuerySharedContext} from '@keplr-wallet/stores';
import {SCAMPORPOSAL_API_URL} from '../../config';

type ScamProposal = Record<string, string[] | undefined>;

export class ScamProposalStore extends ObservableQuery<ScamProposal> {
  constructor(
    sharedContext: QuerySharedContext,
    options: {
      readonly baseURL?: string;
    } = {},
  ) {
    const instance = options.baseURL || SCAMPORPOSAL_API_URL;

    super(sharedContext, instance, '/api/scam-proposal');
  }

  isScamProposal(chainId: string, proposalId: string): boolean {
    const proposals = this.response?.data;

    if (proposals) {
      const scamProposalIds =
        proposals[ChainIdHelper.parse(chainId).identifier];

      if (scamProposalIds) {
        return scamProposalIds.includes(proposalId);
      }
      return false;
    }

    return false;
  }
}
