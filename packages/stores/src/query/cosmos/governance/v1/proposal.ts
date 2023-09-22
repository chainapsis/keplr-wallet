import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { DeepReadonly } from "utility-types";
import { ProposalV1, ProposalTallyV1 } from "./types";
import { ObservableChainQuery } from "../../../chain-query";
import { ChainGetter } from "../../../../common";
import { ObservableQueryGovernanceV1 } from "./proposals";
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { computedFn } from "mobx-utils";
import { ProposalStatus } from "../types";

const zeroDec = new Dec(0);

export class ObservableQueryProposalV1 extends ObservableChainQuery<ProposalTallyV1> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _raw: ProposalV1,
    protected readonly governance: ObservableQueryGovernanceV1
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/gov/v1/proposals/${_raw.id}/tally`
    );
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.proposalStatus === ProposalStatus.VOTING_PERIOD;
  }

  get raw(): DeepReadonly<ProposalV1> {
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
    return this.raw.id;
  }

  get title(): string {
    if (this.raw.title) {
      return this.raw.title;
    }

    if (this.raw.messages.length === 0) {
      return "No Title";
    }

    if (this.raw.messages[0].content?.title) {
      return this.raw.messages[0].content.title;
    }

    if (this.raw.messages[0]["@type"]) {
      return this.raw.messages[0]["@type"];
    }

    if (this.raw.messages[0].content && this.raw.messages[0].content["@type"]) {
      return this.raw.messages[0].content["@type"];
    }

    return "";
  }

  get description(): string {
    if (this.raw.summary) {
      return this.raw.summary;
    }

    if (this.raw.messages[0].content?.description) {
      return this.raw.messages[0].content.description;
    }

    return "";
  }

  @computed
  get turnout(): IntPretty {
    return this.calcTurnout();
  }

  calcTurnout(additionalBondedTokenAmount?: Int | Dec): IntPretty {
    return this.computedCalcTurnout(additionalBondedTokenAmount ?? zeroDec);
  }

  // Remember that we can't optional parameter (additionalBondedTokenAmount?: Int | Dec).
  // However, `additionalBondedTokenAmount` is not used often, so it is not suitable to request to pass that parameter.
  // To avoid this problem, make separate method.
  protected computedCalcTurnout = computedFn(
    (additionalBondedTokenAmount: Int | Dec): IntPretty => {
      const pool = this.governance.getQueryPool();

      if (additionalBondedTokenAmount instanceof Int) {
        additionalBondedTokenAmount = additionalBondedTokenAmount.toDec();
      }

      const bondedTokenDec = pool.bondedTokens
        .toDec()
        .add(additionalBondedTokenAmount);

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
  );

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
        yes: new IntPretty(new Int(this.raw.final_tally_result.yes_count))
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        no: new IntPretty(new Int(this.raw.final_tally_result.no_count))
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        abstain: new IntPretty(
          new Int(this.raw.final_tally_result.abstain_count)
        )
          .moveDecimalPointLeft(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        noWithVeto: new IntPretty(
          new Int(this.raw.final_tally_result.no_with_veto_count)
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
      yes: new IntPretty(new Int(this.response.data.tally.yes_count))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      no: new IntPretty(new Int(this.response.data.tally.no_count))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      abstain: new IntPretty(new Int(this.response.data.tally.abstain_count))
        .moveDecimalPointLeft(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      noWithVeto: new IntPretty(
        new Int(this.response.data.tally.no_with_veto_count)
      )
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
