export interface ProposalType {
  proposal_id: string;
  content: {
    type: string;
    title: string;
    description: string;
    changes: [
      {
        subspace: string;
        key: string;
        value: string;
      }
    ];
  };
  status: string;
  final_tally_result: {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  };
  submit_time: Date;
  deposit_end_time: Date;
  total_deposit: [
    {
      denom: string;
      amount: string;
    }
  ];
  voting_start_time: Date;
  voting_end_time: Date;
}

export interface ProposalSetup {
  votedProposals: ProposalType[];
  activeProposals: ProposalType[];
  closedProposals: ProposalType[];
}
