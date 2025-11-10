import { ChainGetter } from "../../../chain";
import { ObservableCosmwasmContractChainQuery } from "../contract-query";
import { QuerySharedContext } from "../../../common";
import { ObservableChainQueryMap } from "../../chain-query";
import { computed } from "mobx";

interface NeutronGovVote {
  voter: string;
  vote: "yes" | "no" | "abstain";
  power: string;
}

interface NeutronGovVoteResponse {
  vote: NeutronGovVote | null;
}

class ObservableQueryNeutronProposalVoteInner extends ObservableCosmwasmContractChainQuery<NeutronGovVoteResponse> {
  public static readonly NEUTRON_PROPOSAL_MODULE_ADDRESS_MAINNET =
    "neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh";
  public static readonly NEUTRON_PROPOSAL_MODULE_ADDRESS_TESTNET =
    "neutron19sf2y4dvgt02kczemvhktrwvt4aunrahw8qkjq6u3pehdujwssgqrs5e4h";

  protected proposalId: string;
  protected bech32Address: string;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    proposalId: string,
    bech32Address: string
  ) {
    const contractAddress =
      chainId === "neutron-1"
        ? ObservableQueryNeutronProposalVoteInner.NEUTRON_PROPOSAL_MODULE_ADDRESS_MAINNET
        : chainId === "pion-1"
        ? ObservableQueryNeutronProposalVoteInner.NEUTRON_PROPOSAL_MODULE_ADDRESS_TESTNET
        : "";

    super(sharedContext, chainId, chainGetter, contractAddress, {
      get_vote: { proposal_id: parseInt(proposalId), voter: bech32Address },
    });
    this.proposalId = proposalId;
    this.bech32Address = bech32Address;
  }

  @computed
  get vote(): "Yes" | "Abstain" | "No" | "NoWithVeto" | "Unspecified" {
    if (!this.response?.data?.vote) {
      return "Unspecified";
    }

    const voteOption = this.response.data.vote.vote;
    switch (voteOption) {
      case "yes":
        return "Yes";
      case "abstain":
        return "Abstain";
      case "no":
        return "No";
      default:
        return "Unspecified";
    }
  }

  refetch() {
    this.fetch();
  }

  protected override canFetch(): boolean {
    return (
      super.canFetch() &&
      this.bech32Address.length > 0 &&
      (this.chainId === "neutron-1" || this.chainId === "pion-1")
    );
  }
}

export class ObservableQueryNeutronProposalVote extends ObservableChainQueryMap<NeutronGovVoteResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (param: string) => {
      const { proposalId, voter } = JSON.parse(param);

      return new ObservableQueryNeutronProposalVoteInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        proposalId,
        voter
      );
    });
  }

  getVote(
    proposalId: string,
    voter: string
  ): ObservableQueryNeutronProposalVoteInner {
    const param = JSON.stringify({
      proposalId,
      voter,
    });

    return this.get(param) as ObservableQueryNeutronProposalVoteInner;
  }
}
