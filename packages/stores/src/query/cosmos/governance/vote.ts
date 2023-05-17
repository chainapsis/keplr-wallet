import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ProposalVoter } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";

export class ObservableQueryProposalVoteInner extends ObservableChainQuery<ProposalVoter> {
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
      `/cosmos/gov/v1beta1/proposals/${proposalsId}/votes/${bech32Address}`
    );

    this.proposalId = proposalsId;
    this.bech32Address = bech32Address;
  }

  get vote(): "Yes" | "Abstain" | "No" | "NoWithVeto" | "Unspecified" {
    if (!this.response) {
      return "Unspecified";
    }

    switch (this.response.data.vote.option) {
      case "VOTE_OPTION_YES":
        return "Yes";
      case "VOTE_OPTION_ABSTAIN":
        return "Abstain";
      case "VOTE_OPTION_NO":
        return "No";
      case "VOTE_OPTION_NO_WITH_VETO":
        return "NoWithVeto";
      default:
        return "Unspecified";
    }
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }
}

export class ObservableQueryProposalVote extends ObservableChainQueryMap<ProposalVoter> {
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
