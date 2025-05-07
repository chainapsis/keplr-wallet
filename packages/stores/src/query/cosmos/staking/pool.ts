import { ObservableChainQuery } from "../../chain-query";
import { StakingPool } from "./types";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
import { QuerySharedContext } from "../../../common";
import { ENDPOINT_BY_CHAIN_ID } from "./endpoint-by-chain-id";

export class ObservableQueryStakingPool extends ObservableChainQuery<StakingPool> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      ENDPOINT_BY_CHAIN_ID[chainId]?.["pool"] ?? "/cosmos/staking/v1beta1/pool"
    );

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (!this.chainGetter.getChain(this.chainId).stakeCurrency) {
      return false;
    }
    return super.canFetch();
  }

  @computed
  get notBondedTokens(): CoinPretty | undefined {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    if (!chainInfo.stakeCurrency) {
      return;
    }

    if (!this.response) {
      return new CoinPretty(chainInfo.stakeCurrency, 0);
    }

    return new CoinPretty(
      chainInfo.stakeCurrency,
      this.response.data.pool.not_bonded_tokens
    );
  }

  @computed
  get bondedTokens(): CoinPretty | undefined {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    if (!chainInfo.stakeCurrency) {
      return;
    }

    if (!this.response) {
      return new CoinPretty(chainInfo.stakeCurrency, 0);
    }

    return new CoinPretty(
      chainInfo.stakeCurrency,
      this.response.data.pool.bonded_tokens
    );
  }
}
