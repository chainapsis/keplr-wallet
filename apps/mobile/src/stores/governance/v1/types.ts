export interface ProposalV1 {
  id: string;
  messages: {
    '@type': string;
    authority: string;
    content?: {
      '@type': string;
      title?: string;
      description?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }[];
  status: GovV1ProposalStatus;
  final_tally_result: GovV1TallyResult;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: Coin[];
  voting_start_time: string;
  voting_end_time: string;
  metadata: string;
  // Since: cosmos-sdk 0.47
  title: string;
  // Since: cosmos-sdk 0.47
  summary: string;
  // Since: cosmos-sdk 0.47
  proposer?: string;
  // Since: cosmos-sdk 0.48
  expedited?: boolean;
}

export type GovV1ProposalStatus =
  | 'PROPOSAL_STATUS_UNSPECIFIED'
  | 'PROPOSAL_STATUS_DEPOSIT_PERIOD'
  | 'PROPOSAL_STATUS_VOTING_PERIOD'
  | 'PROPOSAL_STATUS_PASSED'
  | 'PROPOSAL_STATUS_REJECTED'
  | 'PROPOSAL_STATUS_FAILED'
  | 'PROPOSAL_STATUS_VALIDATOR_VOTING_PERIOD' // Shentu
  | 'PROPOSAL_STATUS_CERTIFIER_VOTING_PERIOD'; // Shentu

export interface GovV1TallyResult {
  yes_count: string;
  abstain_count: string;
  no_count: string;
  no_with_veto_count: string;
}

export interface Coin {
  denom: string;
  amount: string;
}

export type GovV1Proposals = {
  proposals: ProposalV1[];
  pagination: PaginationResponse;
};

export interface PaginationResponse {
  next_key: string | null;
  total: string;
}

export interface GovV1ParamsTally {
  // It will be deprecated
  tally_params: GovV1TallyParams;
  // Since: cosmos-sdk 0.47
  params: GovV1Params;
}

export interface GovV1ParamsVoting {
  // It will be deprecated
  voting_params: GovV1VotingParams;
  // Since: cosmos-sdk 0.47
  params: GovV1Params;
}

export interface GovV1ParamsDeposit {
  // It will be deprecated
  deposit_params: GovV1DepositParams;
  // Since: cosmos-sdk 0.47
  params: GovV1Params;
}

// It will be deprecated
export interface GovV1VotingParams {
  voting_period: string;
}

// It will be deprecated
export interface GovV1DepositParams {
  min_deposit: Coin[];
  max_deposit_period: string;
}

// It will be deprecated
export interface GovV1TallyParams {
  quorum: string;
  threshold: string;
  veto_threshold: string;
}

// Since: cosmos-sdk 0.47
export interface GovV1Params {
  min_deposit: Coin[];
  max_deposit_period: string;
  voting_period: string;
  quorum: string;
  threshold: string;
  // Default value: 1/3
  veto_threshold: string;
  min_initial_deposit_ratio: string;
  // Since: cosmos-sdk 0.48
  proposal_cancel_ratio: string;
  // Since: cosmos-sdk 0.48
  proposal_cancel_dest: string;
  // Since: cosmos-sdk 0.48
  expedited_voting_period: string;
  // Since: cosmos-sdk 0.48
  expedited_threshold: string;
  expedited_min_deposit: Coin[];
  burn_vote_quorum: boolean;
  burn_proposal_deposit_prevote: boolean;
  burn_vote_veto: boolean;
}

export type ProposalTallyV1 = {
  tally: GovV1TallyResult;
};

export interface ProposalVoterV1 {
  vote: {
    proposal_id: string;
    voter: string;
    options: {
      option: GovV1VoteOption;
      weight: string;
    }[];
    metadata: string;
  };
}

export type GovV1VoteOption =
  | 'VOTE_OPTION_UNSPECIFIED'
  | 'VOTE_OPTION_YES'
  | 'VOTE_OPTION_NO'
  | 'VOTE_OPTION_NO_WITH_VETO'
  | 'VOTE_OPTION_ABSTAIN';
