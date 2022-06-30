import { ObservableChainQuery } from "../../chain-query";
import { StakingPool } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";

export class ObservableQueryStakingPool extends ObservableChainQuery<StakingPool> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/cosmos/staking/v1beta1/pool");

    makeObservable(this);
  }

  @computed
  get notBondedTokens(): CoinPretty {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    if (!this.response) {
      return new CoinPretty(chainInfo.stakeCurrency, 0);
    }

    return new CoinPretty(
      chainInfo.stakeCurrency,
      this.response.data.pool.not_bonded_tokens
    );
  }

  @computed
  get bondedTokens(): CoinPretty {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    if (!this.response) {
      return new CoinPretty(chainInfo.stakeCurrency, 0);
    }

    return new CoinPretty(
      chainInfo.stakeCurrency,
      this.response.data.pool.bonded_tokens
    );
  }
}
