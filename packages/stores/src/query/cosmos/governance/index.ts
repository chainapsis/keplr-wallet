import { ObservableChainQuery } from "../../chain-query";
import { GovProposals, Proposal, ProposalTally } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable, observable, runInAction } from "mobx";
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { DeepReadonly } from "utility-types";
import {
  ObservableQueryGovParamDeposit,
  ObservableQueryGovParamTally,
  ObservableQueryGovParamVoting,
} from "./params";
import { computedFn } from "mobx-utils";
import { StakingPool } from "../staking/types";

export class ObservableQueryProposal extends ObservableChainQuery<ProposalTally> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _raw: Proposal,
    protected readonly governance: ObservableQueryGovernance
  ) {
    super(kvStore, chainId, chainGetter, `/gov/proposals/${_raw.id}/tally`);
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.raw.proposal_status === "VotingPeriod";
  }

  get raw(): DeepReadonly<Proposal> {
    return this._raw;
  }

  get id(): string {
    return this.raw.id;
  }

  get title(): string {
    return this.raw.content.value.title;
  }

  get description(): string {
    return this.raw.content.value.description;
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

    if (this.raw.proposal_status !== "VotingPeriod") {
      return {
        yes: new IntPretty(new Int(this.raw.final_tally_result.yes))
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        no: new IntPretty(new Int(this.raw.final_tally_result.no))
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        abstain: new IntPretty(new Int(this.raw.final_tally_result.abstain))
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        noWithVeto: new IntPretty(
          new Int(this.raw.final_tally_result.no_with_veto)
        )
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
      };
    }

    if (!this.response) {
      return {
        yes: new IntPretty(new Int(0))
          .ready(false)
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        no: new IntPretty(new Int(0))
          .ready(false)
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        abstain: new IntPretty(new Int(0))
          .ready(false)
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
        noWithVeto: new IntPretty(new Int(0))
          .ready(false)
          .precision(stakeCurrency.coinDecimals)
          .maxDecimals(stakeCurrency.coinDecimals),
      };
    }

    return {
      yes: new IntPretty(new Int(this.response.data.result.yes))
        .precision(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      no: new IntPretty(new Int(this.response.data.result.no))
        .precision(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      abstain: new IntPretty(new Int(this.response.data.result.abstain))
        .precision(stakeCurrency.coinDecimals)
        .maxDecimals(stakeCurrency.coinDecimals),
      noWithVeto: new IntPretty(new Int(this.response.data.result.no_with_veto))
        .precision(stakeCurrency.coinDecimals)
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

export class ObservableQueryGovernance extends ObservableChainQuery<GovProposals> {
  @observable.ref
  protected paramDeposit?: ObservableQueryGovParamDeposit = undefined;
  @observable.ref
  protected paramVoting?: ObservableQueryGovParamVoting = undefined;
  @observable.ref
  protected paramTally?: ObservableQueryGovParamTally = undefined;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _queryPool: ObservableChainQuery<StakingPool>
  ) {
    super(kvStore, chainId, chainGetter, "/gov/proposals");
    makeObservable(this);
  }

  getQueryPool(): DeepReadonly<ObservableChainQuery<StakingPool>> {
    return this._queryPool;
  }

  getQueryParamDeposit(): DeepReadonly<ObservableQueryGovParamDeposit> {
    if (!this.paramDeposit) {
      runInAction(() => {
        this.paramDeposit = new ObservableQueryGovParamDeposit(
          this.kvStore,
          this.chainId,
          this.chainGetter
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramDeposit!;
  }

  getQueryParamVoting(): DeepReadonly<ObservableQueryGovParamVoting> {
    if (!this.paramVoting) {
      runInAction(() => {
        this.paramVoting = new ObservableQueryGovParamVoting(
          this.kvStore,
          this.chainId,
          this.chainGetter
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramVoting!;
  }

  getQueryParamTally(): DeepReadonly<ObservableQueryGovParamTally> {
    if (!this.paramTally) {
      runInAction(() => {
        this.paramTally = new ObservableQueryGovParamTally(
          this.kvStore,
          this.chainId,
          this.chainGetter
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.paramTally!;
  }

  @computed
  get quorum(): IntPretty {
    const paramTally = this.getQueryParamTally();
    if (!paramTally.response) {
      return new IntPretty(new Int(0)).ready(false);
    }

    let quorum = new Dec(paramTally.response.data.result.quorum);
    // Multiply 100
    quorum = quorum.mulTruncate(DecUtils.getPrecisionDec(2));

    return new IntPretty(quorum);
  }

  @computed
  get proposals(): DeepReadonly<ObservableQueryProposal[]> {
    if (!this.response) {
      return [];
    }

    const result: ObservableQueryProposal[] = [];

    for (const raw of this.response.data.result) {
      result.push(
        new ObservableQueryProposal(
          this.kvStore,
          this.chainId,
          this.chainGetter,
          raw,
          this
        )
      );
    }

    return result.reverse();
  }

  readonly getProposal = computedFn((id: string):
    | DeepReadonly<ObservableQueryProposal>
    | undefined => {
    return this.proposals.find((proposal) => proposal.id === id);
  });
}
