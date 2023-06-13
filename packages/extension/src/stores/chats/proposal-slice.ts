import { createSlice } from "@reduxjs/toolkit";
import { ProposalSetup } from "src/@types/proposal-type";

const initialState = {
  proposals: {
    votedProposals: [],
    activeProposals: [],
    closedProposals: [],
    allProposals: [],
  } as ProposalSetup,
};

export const proposalSlice = createSlice({
  name: "proposal",
  initialState: initialState,
  reducers: {
    resetProposals: (_state, _action) => initialState,
    setProposalsInStore: (state, action) => {
      state.proposals = { ...state.proposals, ...action.payload };
    },
  },
});

export const { setProposalsInStore, resetProposals } = proposalSlice.actions;
export const useProposals = (state: { proposal: any }) =>
  state.proposal.proposals;
export const proposalStore = proposalSlice.reducer;
