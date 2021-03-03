import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ProposalVoter, ProposalVoterStargate } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";

export class ObservableQueryProposalVoteInner extends ObservableChainQuery<
  ProposalVoter | ProposalVoterStargate
> {
  protected proposalId: string;
  protected bech32Address: string;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    proposalsId: string,
    bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/gov/proposals/${proposalsId}/votes/${bech32Address}`
    );

    this.proposalId = proposalsId;
    this.bech32Address = bech32Address;
  }

  get vote(): "Yes" | "Abstain" | "No" | "NoWithVeto" | "Unspecified" {
    if (!this.response) {
      return "Unspecified";
    }
    if (typeof this.response.data.result.option === "string") {
      return this.response.data.result.option;
    }

    return (() => {
      switch (this.response.data.result.option) {
        //yes: 1, abstain: 2, no: 3, no with veto: 4)
        case 1:
          return "Yes";
        case 2:
          return "Abstain";
        case 3:
          return "No";
        case 4:
          return "NoWithVeto";
        default:
          return "Unspecified";
      }
    })();
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }
}

export class ObservableQueryProposalVote extends ObservableChainQueryMap<
  ProposalVoter | ProposalVoterStargate
> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (param: string) => {
      const { proposalId, voter } = JSON.parse(param);

      return new ObservableQueryProposalVoteInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        proposalId,
        voter
      );
    });
  }

  getVote(proposalId: string, voter: string): ObservableQueryProposalVoteInner {
    const param = JSON.stringify({
      proposalId,
      voter,
    });
    return this.get(param) as ObservableQueryProposalVoteInner;
  }
}
