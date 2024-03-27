import { makeAutoObservable } from "mobx";

export class ProposalStore {
  proposals = {
    votedProposals: [],
    activeProposals: [],
    closedProposals: [],
    allProposals: [],
  };

  constructor() {
    makeAutoObservable(this);
  }

  resetProposals() {
    this.proposals = {
      votedProposals: [],
      activeProposals: [],
      closedProposals: [],
      allProposals: [],
    };
  }

  setProposalsInStore(proposals: any) {
    this.proposals = { ...this.proposals, ...proposals };
  }
}

export const proposalStore = new ProposalStore();
