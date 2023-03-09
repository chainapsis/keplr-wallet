import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ObservableQuery } from "@keplr-wallet/stores";

type ScamProposal = Record<string, string[] | undefined>;

export class ScamProposalStore extends ObservableQuery<ScamProposal> {
  constructor(
    kvStore: KVStore,
    options: {
      readonly baseURL?: string;
    } = {}
  ) {
    const instance = Axios.create({
      baseURL:
        options.baseURL || "https://phishing-block-list-chainapsis.vercel.app",
    });

    super(kvStore, instance, "/api/scam-proposal");
  }

  isScamProposal(chainId: string, proposalId: string): boolean {
    const proposals = this.response?.data;

    if (proposals) {
      const scamProposalIds =
        proposals[ChainIdHelper.parse(chainId).identifier];

      if (scamProposalIds) {
        return scamProposalIds.includes(proposalId);
      }
      return false;
    }

    return false;
  }
}
