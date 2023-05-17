import { ObservableChainQuery } from "../../chain-query";
import { StakingParams } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";

export class ObservableQueryStakingParams extends ObservableChainQuery<StakingParams> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/cosmos/staking/v1beta1/params");

    makeObservable(this);
  }

  @computed
  get unbondingTimeSec(): number {
    if (!this.response) {
      return 0;
    }

    return parseInt(this.response.data.params.unbonding_time.replace("s", ""));
  }

  get maxValidators(): number {
    return this.response?.data.params.max_validators ?? 0;
  }

  get maxEntries(): number {
    return this.response?.data.params.max_entries ?? 0;
  }

  get historicalEntries(): number {
    return this.response?.data.params.historical_entries ?? 0;
  }

  get bondDenom(): string {
    return this.response?.data.params.bond_denom ?? "";
  }
}
