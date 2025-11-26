import { ChainGetter } from "../../../chain";
import { ObservableCosmwasmContractChainQuery } from "../contract-query";
import { QuerySharedContext } from "../../../common";
import { ObservableChainQueryMap } from "../../chain-query";
import { computed } from "mobx";

export enum NeutronGovProposalStatus {
  OPEN = "open",
  PASSED = "passed",
  REJECTED = "rejected",
  EXECUTED = "executed",
  CLOSED = "closed",
  EXECUTION_FAILED = "execution_failed",
}

interface NeutronGovThreshold {
  threshold_quorum?: {
    threshold: string;
    quorum: string;
  };
  absolute_percentage?: {
    percentage: string;
  };
}

interface NeutronGovProposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  start_height: number;
  min_voting_period: null;
  expiration: {
    at_time?: string;
    at_height?: string;
  };
  threshold: NeutronGovThreshold;
  total_power: string;
  msgs: unknown[];
  status: NeutronGovProposalStatus;
  votes: {
    yes: string;
    no: string;
    abstain: string;
  };
  allow_revoting: boolean;
}

interface NeutronGovProposalsResponse {
  proposals: {
    id: number;
    proposal: NeutronGovProposal;
  }[];
}

class ObservableQueryNeutronGovernanceInner extends ObservableCosmwasmContractChainQuery<NeutronGovProposalsResponse> {
  public static readonly NEUTRON_PROPOSAL_MODULE_ADDRESS_MAINNET =
    "neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh";
  public static readonly NEUTRON_PROPOSAL_MODULE_ADDRESS_TESTNET =
    "neutron19sf2y4dvgt02kczemvhktrwvt4aunrahw8qkjq6u3pehdujwssgqrs5e4h";

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly params: { start_before?: number; limit?: number }
  ) {
    const contractAddress =
      chainId === "neutron-1"
        ? ObservableQueryNeutronGovernanceInner.NEUTRON_PROPOSAL_MODULE_ADDRESS_MAINNET
        : chainId === "pion-1"
        ? ObservableQueryNeutronGovernanceInner.NEUTRON_PROPOSAL_MODULE_ADDRESS_TESTNET
        : "";

    super(sharedContext, chainId, chainGetter, contractAddress, {
      reverse_proposals: params || { limit: 20 },
    });
  }

  protected override canFetch(): boolean {
    return (
      super.canFetch() &&
      (this.chainId === "neutron-1" || this.chainId === "pion-1")
    );
  }

  @computed
  get proposals(): {
    id: number;
    proposal: NeutronGovProposal;
  }[] {
    if (!this.response?.data) {
      return [];
    }
    return this.response.data.proposals || [];
  }
}

export class ObservableQueryNeutronGovernance extends ObservableChainQueryMap<NeutronGovProposalsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (param: string) => {
      const parsedParams = JSON.parse(param);
      return new ObservableQueryNeutronGovernanceInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        parsedParams
      );
    });
  }

  getQueryGovernanceWithPage(params: { page: number; perPageNumber: number }): {
    proposals: { id: number; proposal: NeutronGovProposal }[];
    firstFetching: boolean;
    nextKey: number | null;
    isFetching: boolean;
  } {
    const list = Array.from({ length: params.page + 1 }, (_, i) => {
      return JSON.stringify({
        start_before: i === 0 ? undefined : i * params.perPageNumber,
        limit: params.perPageNumber,
      });
    });

    const proposals = list.flatMap((param) => {
      const query = this.get(param) as ObservableQueryNeutronGovernanceInner;
      return query.proposals;
    });

    const lastQuery = this.get(
      list[list.length - 1]
    ) as ObservableQueryNeutronGovernanceInner;

    const nextKey =
      lastQuery.proposals.length === params.perPageNumber
        ? proposals[proposals.length - 1]?.id
        : null;

    return {
      proposals,
      firstFetching: lastQuery.isFetching && proposals.length === 0,
      nextKey,
      isFetching: lastQuery.isFetching,
    };
  }
}
