import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { BabylonRewardGauges } from "./types";
import { ChainGetter } from "../../../chain";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryBabylonBtcDelegationRewardInner extends ObservableChainQuery<BabylonRewardGauges> {
  protected bech32Address: string;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/babylon/incentive/address/${bech32Address}/reward_gauge`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return (
      this.bech32Address.length > 0 ||
      this.chainGetter.getChain(this.chainId).stakeCurrency != null
    );
  }

  @computed
  get claimable(): CoinPretty | undefined {
    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!stakeCurrency) {
      return;
    }

    if (!this.response) {
      return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
    }

    const btcDelegation = this.response.data.reward_gauges.BTC_STAKER;

    const totalRewards = btcDelegation.coins.find(
      (coin) => coin.denom === stakeCurrency.coinMinimalDenom
    );

    const withdrawnRewards = btcDelegation.withdrawn_coins.find(
      (coin) => coin.denom === stakeCurrency.coinMinimalDenom
    );

    if (!totalRewards || !withdrawnRewards) {
      return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
    }

    const claimable = new Int(totalRewards.amount).sub(
      new Int(withdrawnRewards.amount)
    );

    return new CoinPretty(stakeCurrency, claimable);
  }
}

export class ObservableQueryBabylonBtcDelegationReward extends ObservableChainQueryMap<BabylonRewardGauges> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryBabylonBtcDelegationRewardInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryBabylonBtcDelegationRewardInner {
    return this.get(
      bech32Address
    ) as ObservableQueryBabylonBtcDelegationRewardInner;
  }
}
