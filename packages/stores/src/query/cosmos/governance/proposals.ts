import { ObservableChainQuery } from "../../chain-query";
import { GovProposals } from "./types";
import { computed, makeObservable, observable, runInAction } from "mobx";
import {
  ObservableQueryGovParamDeposit,
  ObservableQueryGovParamTally,
  ObservableQueryGovParamVoting,
} from "./params";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { StakingPool } from "../staking/types";
import { DeepReadonly } from "utility-types";
import { Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { computedFn } from "mobx-utils";
import { ObservableQueryProposal } from "./proposal";

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
    super(kvStore, chainId, chainGetter, "/gov/proposals?limit=1000");
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

    // XXX: In the current mobile, this getter is executed first on the home screen.
    //      Because there is an issue related to networking in mobile,
    //      we need temporarily log the console to check the response until this problem is sufficiently resolved.
    // https://github.com/chainapsis/keplr-wallet/issues/275
    // https://github.com/chainapsis/keplr-wallet/issues/278
    // TODO: Erase this part soon
    console.log("proposals response", this.response);
    console.log("proposals response data", this.response.data);

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
