// This is not the type for result of query.
export enum ProposalStatus {
  UNSPECIFIED,
  DEPOSIT_PERIOD,
  VOTING_PERIOD,
  PASSED,
  REJECTED,
  FAILED,
}

export type Tally = {
  // Int
  yes: string;
  abstain: string;
  no: string;
  no_with_veto: string;
};

export type ProposalTally = {
  height: string;
  result: Tally;
};

export type Proposal = {
  content:
    | {
        type: string;
        value: {
          title: string;
          description: string;
        };
      }
    // If the proposal isn't registered to the amino codec,
    // legacy endpoint will return the content without `type`
    | {
        title: string;
        description: string;
      };
  // Int
  id: string;
  proposal_status: string;
  final_tally_result: Tally;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: [
    {
      denom: string;
      // Int
      amount: string;
    }
  ];
  voting_start_time: string;
  voting_end_time: string;
};

export type ProposalStargate = {
  content: {
    type: string;
    value: {
      title: string;
      description: string;
    };
  };
  // Int
  id: string;
  // Proposal status is changed to the ENUM.
  status: number;
  final_tally_result: Tally;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: [
    {
      denom: string;
      // Int
      amount: string;
    }
  ];
  voting_start_time: string;
  voting_end_time: string;
};

export type GovProposals = {
  height: string;
  result: Proposal[] | ProposalStargate[];
};

export type GovParamsDeposit = {
  height: string;
  result: {
    min_deposit: [
      {
        denom: string;
        amount: string;
      }
    ];
    max_deposit_period: string;
  };
};

export type GovParamsVoting = {
  height: string;
  result: {
    voting_period: string;
  };
};

export type GovParamsTally = {
  height: string;
  result: {
    // Dec
    quorum: string;
    threshold: string;
    veto: string;
  };
};

export type ProposalVoter = {
  height: string;
  result: {
    proposal_id: string;
    voter: string;
    option: "Yes" | "Abstain" | "No" | "NoWithVeto";
  };
};

export type ProposalVoterStargate = {
  height: string;
  result: {
    proposal_id: string;
    voter: string;
    // Vote option is enum on the stargate
    // (empty: 0, yes: 1, abstain: 2, no: 3, no with veto: 4)
    option: number;
  };
};
