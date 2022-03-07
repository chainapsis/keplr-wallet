import { ObservableChainQuery } from "../../chain-query";
import {
  Proposal,
  ProposalStargate,
  ProposalStatus,
  ProposalTally,
} from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
import { DeepReadonly } from "utility-types";
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { ObservableQueryGovernance } from "./proposals";

export class ObservableQueryProposal extends ObservableChainQuery<ProposalTally> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _raw: Proposal | ProposalStargate,
    protected readonly governance: ObservableQueryGovernance
  ) {
    super(kvStore, chainId, chainGetter, `/gov/proposals/${_raw.id}/tally`);
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.proposalStatus === ProposalStatus.VOTING_PERIOD;
  }

  get raw(): DeepReadonly<Proposal | ProposalStargate> {
    return this._raw;
  }

  get proposalStatus(): ProposalStatus {
    if ("proposal_status" in this.raw) {
      switch (this.raw.proposal_status) {
        case "DepositPeriod":
          return ProposalStatus.DEPOSIT_PERIOD;
        case "VotingPeriod":
          return ProposalStatus.VOTING_PERIOD;
        case "Passed":
          return ProposalStatus.PASSED;
        case "Rejected":
          return ProposalStatus.REJECTED;
        case "Failed":
          return ProposalStatus.FAILED;
        default:
          return ProposalStatus.UNSPECIFIED;
      }
    }

    switch (this.raw.status) {
      case 1:
        return ProposalStatus.DEPOSIT_PERIOD;
      case 2:
        return ProposalStatus.VOTING_PERIOD;
      case 3:
        return ProposalStatus.PASSED;
      case 4:
        return ProposalStatus.REJECTED;
      case 5:
        return ProposalStatus.FAILED;
      default:
        return ProposalStatus.UNSPECIFIED;
    }
  }

  get id(): string {
    return this.raw.id;
  }

  get title(): string {
    if ("value" in this.raw.content) {
      return this.raw.content.value.title;
    }

    return this.raw.content.title;
  }

  get description(): string {
    if ("value" in this.raw.content) {
      return this.raw.content.value.description;
    }

    return this.raw.content.description;
  }

  @computed
  get turnout(): IntPretty {
    const pool = this.governance.getQueryPool();

    if (!pool.response) {
      return new IntPretty(new Dec(0)).ready(false);
    }

    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    const bondedToken = new Dec(
      pool.response.data.result.bonded_tokens
    ).quoTruncate(DecUtils.getPrecisionDec(stakeCurrency.coinDecimals));
    const tally = this.tally;
    const tallySum = tally.yes
      .add(tally.no)
      .add(tally.abstain)
      .add(tally.noWithVeto);

    return new IntPretty(
      tallySum
        .toDec()
        .quoTruncate(bondedToken)
        .mulTruncate(DecUtils.getPrecisionDec(2))
    ).ready(tally.yes.isReady);
  }

  /**
   * Return the voting tally.
   * If the proposal status is passed or rejected, it returns the final tally of the proposal.
   * If the proposal status is in voting period, it queries the tally to the rest endpoint.
   * If the querying of tally is not completed, it return the tally with all 0 with not ready option.
   */
  @computed
  get tally(): {
    yes: IntPretty;
    abstain: IntPretty;
    no: IntPretty;
    noWithVeto: IntPretty;
  } {
    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (this.proposalStatus !== ProposalStatus.VOTING_PERIOD) {
      return {
        yes: new IntPretty(new Int(this.raw.final_tally_result.yes))
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        no: new IntPretty(new Int(this.raw.final_tally_result.no))
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        abstain: new IntPretty(new Int(this.raw.final_tally_result.abstain))
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        noWithVeto: new IntPretty(
          new Int(this.raw.final_tally_result.no_with_veto)
        )
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
      };
    }

    if (!this.response) {
      return {
        yes: new IntPretty(new Int(0))
          .ready(false)
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        no: new IntPretty(new Int(0))
          .ready(false)
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        abstain: new IntPretty(new Int(0))
          .ready(false)
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        noWithVeto: new IntPretty(new Int(0))
          .ready(false)
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
      };
    }

    return {
      yes: new IntPretty(new Int(this.response.data.result.yes))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      no: new IntPretty(new Int(this.response.data.result.no))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      abstain: new IntPretty(new Int(this.response.data.result.abstain))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      noWithVeto: new IntPretty(new Int(this.response.data.result.no_with_veto))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
    };
  }

  @computed
  get total(): CoinPretty {
    const tally = this.tally;
    const tallySum = tally.yes
      .add(tally.no)
      .add(tally.abstain)
      .add(tally.noWithVeto);

    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    return new CoinPretty(stakeCurrency, tallySum);
  }

  @computed
  get tallyRatio(): {
    yes: IntPretty;
    abstain: IntPretty;
    no: IntPretty;
    noWithVeto: IntPretty;
  } {
    const tally = this.tally;
    const tallySum = tally.yes
      .add(tally.no)
      .add(tally.abstain)
      .add(tally.noWithVeto);

    if (tallySum.toDec().equals(new Dec(0))) {
      return {
        yes: new IntPretty(new Int(0)).ready(false),
        no: new IntPretty(new Int(0)).ready(false),
        abstain: new IntPretty(new Int(0)).ready(false),
        noWithVeto: new IntPretty(new Int(0)).ready(false),
      };
    }

    return {
      yes: new IntPretty(
        tally.yes
          .toDec()
          .quoTruncate(tallySum.toDec())
          .mulTruncate(DecUtils.getPrecisionDec(2))
      ).ready(tally.yes.isReady),
      no: new IntPretty(
        tally.no
          .toDec()
          .quoTruncate(tallySum.toDec())
          .mulTruncate(DecUtils.getPrecisionDec(2))
      ).ready(tally.no.isReady),
      abstain: new IntPretty(
        tally.abstain
          .toDec()
          .quoTruncate(tallySum.toDec())
          .mulTruncate(DecUtils.getPrecisionDec(2))
      ).ready(tally.abstain.isReady),
      noWithVeto: new IntPretty(
        tally.noWithVeto
          .toDec()
          .quoTruncate(tallySum.toDec())
          .mulTruncate(DecUtils.getPrecisionDec(2))
      ).ready(tally.noWithVeto.isReady),
    };
  }
}
