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
  content: {
    type: string;
    value: {
      title: string;
      description: string;
    };
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

export type GovProposals = {
  height: string;
  result: Proposal[];
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
