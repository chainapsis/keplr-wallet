import { ObservableChainQuery } from "../../chain-query";
import { Proposal, ProposalStatus, ProposalTally } from "./types";
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
    protected readonly _raw: Proposal,
    protected readonly governance: ObservableQueryGovernance
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/gov/v1beta1/proposals/${_raw.proposal_id}/tally`
    );
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.proposalStatus === ProposalStatus.VOTING_PERIOD;
  }

  get raw(): DeepReadonly<Proposal> {
    return this._raw;
  }

  get proposalStatus(): ProposalStatus {
    switch (this.raw.status) {
      case "PROPOSAL_STATUS_DEPOSIT_PERIOD":
        return ProposalStatus.DEPOSIT_PERIOD;
      case "PROPOSAL_STATUS_VOTING_PERIOD":
        return ProposalStatus.VOTING_PERIOD;
      case "PROPOSAL_STATUS_PASSED":
        return ProposalStatus.PASSED;
      case "PROPOSAL_STATUS_REJECTED":
        return ProposalStatus.REJECTED;
      case "PROPOSAL_STATUS_FAILED":
        return ProposalStatus.FAILED;
      default:
        return ProposalStatus.UNSPECIFIED;
    }
  }

  get id(): string {
    return this.raw.proposal_id;
  }

  get title(): string {
    return this.raw.content.title;
  }

  get description(): string {
    return this.raw.content.description;
  }

  @computed
  get turnout(): IntPretty {
    const pool = this.governance.getQueryPool();

    const bondedTokenDec = pool.bondedTokens.toDec();

    if (!pool.response || bondedTokenDec.equals(new Dec(0))) {
      return new IntPretty(new Dec(0)).ready(false);
    }

    const tally = this.tally;
    const tallySum = tally.yes
      .add(tally.no)
      .add(tally.abstain)
      .add(tally.noWithVeto);

    // TODO: Use `RatePretty`
    return new IntPretty(
      tallySum
        .toDec()
        .quoTruncate(bondedTokenDec)
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
      yes: new IntPretty(new Int(this.response.data.tally.yes))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      no: new IntPretty(new Int(this.response.data.tally.no))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      abstain: new IntPretty(new Int(this.response.data.tally.abstain))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      noWithVeto: new IntPretty(new Int(this.response.data.tally.no_with_veto))
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

    // TODO: Use `RatePretty`
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
