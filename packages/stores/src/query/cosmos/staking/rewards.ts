import { Rewards } from "./types";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import {
  CoinPrimitive,
  QueryResponse,
  QuerySharedContext,
  StoreUtils,
} from "../../../common";
import { computedFn } from "mobx-utils";

export class ObservableQueryRewardsInner extends ObservableChainQuery<Rewards> {
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
      `/cosmos/distribution/v1beta1/delegators/${bech32Address}/rewards`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected override canFetch(): boolean {
    if (!this.chainGetter.getModularChainInfoImpl(this.chainId).stakeCurrency) {
      return false;
    }
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  @computed
  get rewards(): CoinPretty[] {
    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);

    if (!this.response || !this.response.data.rewards) {
      return [];
    }

    const map = new Map<string, CoinPrimitive>();
    for (const valRewards of this.response.data.rewards) {
      for (const coin of valRewards.reward ?? []) {
        const amount = new Dec(coin.amount).truncate();
        if (!amount.gt(new Int(0))) {
          continue;
        }

        const existing = map.get(coin.denom);
        if (existing) {
          existing.amount = new Int(existing.amount).add(amount).toString();
        } else {
          map.set(coin.denom, {
            denom: coin.denom,
            amount: amount.toString(),
          });
        }
      }
    }

    return StoreUtils.toCoinPretties(chainInfo, Array.from(map.values()));
  }

  readonly getRewardsOf = computedFn(
    (validatorAddress: string): CoinPretty[] => {
      const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);

      const rewards = this.response?.data.rewards?.find((r) => {
        return r.validator_address === validatorAddress;
      });

      if (!rewards || !rewards.reward) {
        return [];
      }

      const map = new Map<string, CoinPrimitive>();
      for (const coin of rewards.reward) {
        const amount = new Dec(coin.amount).truncate();
        if (!amount.gt(new Int(0))) {
          continue;
        }

        const existing = map.get(coin.denom);
        if (existing) {
          existing.amount = new Int(existing.amount).add(amount).toString();
        } else {
          map.set(coin.denom, {
            denom: coin.denom,
            amount: amount.toString(),
          });
        }
      }

      return StoreUtils.toCoinPretties(chainInfo, Array.from(map.values()));
    }
  );

  @computed
  get stakableReward(): CoinPretty | undefined {
    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);

    if (!chainInfo.stakeCurrency) {
      return;
    }

    const r = this.rewards.find((r) => {
      return (
        r.currency.coinMinimalDenom ===
        chainInfo.stakeCurrency?.coinMinimalDenom
      );
    });

    return r ?? new CoinPretty(chainInfo.stakeCurrency, new Int(0));
  }

  readonly getStakableRewardOf = computedFn(
    (validatorAddress: string): CoinPretty | undefined => {
      const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);

      if (!chainInfo.stakeCurrency) {
        return;
      }

      const valRewards = this.getRewardsOf(validatorAddress);
      const r = valRewards.find((r) => {
        return (
          r.currency.coinMinimalDenom ===
          chainInfo.stakeCurrency?.coinMinimalDenom
        );
      });

      return r ?? new CoinPretty(chainInfo.stakeCurrency, new Int(0));
    }
  );

  @computed
  get unstakableRewards(): CoinPretty[] {
    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);

    return this.rewards.filter((r) => {
      return (
        r.currency.coinMinimalDenom !==
        chainInfo.stakeCurrency?.coinMinimalDenom
      );
    });
  }

  readonly getUnstakableRewardsOf = computedFn(
    (validatorAddress: string): CoinPretty[] => {
      return this.getRewardsOf(validatorAddress).filter((r) => {
        return (
          r.currency.coinMinimalDenom !==
          this.chainGetter.getModularChainInfoImpl(this.chainId).stakeCurrency
            ?.coinMinimalDenom
        );
      });
    }
  );

  @computed
  get pendingRewardValidatorAddresses(): string[] {
    if (!this.response) {
      return [];
    }

    const result: string[] = [];

    for (const reward of this.response.data.rewards ?? []) {
      if (reward.reward) {
        for (const r of reward.reward) {
          const dec = new Dec(r.amount);
          if (dec.truncate().gt(new Int(0))) {
            result.push(reward.validator_address);
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * getDescendingPendingRewardValidatorAddresses returns the validator addresses in descending order by stakable asset.
   */
  // ComputeFn doesn't support the default argument.
  readonly getDescendingPendingRewardValidatorAddresses = computedFn(
    (maxValiadtors: number): string[] => {
      if (!this.response) {
        return [];
      }

      const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);

      if (!chainInfo.stakeCurrency) {
        return [];
      }

      const rewards = this.response.data.rewards?.slice() ?? [];
      rewards.sort((reward1, reward2) => {
        const amount1 = StoreUtils.getBalanceFromCurrency(
          chainInfo.stakeCurrency!,
          reward1.reward ?? []
        );

        const amount2 = StoreUtils.getBalanceFromCurrency(
          chainInfo.stakeCurrency!,
          reward2.reward ?? []
        );

        if (amount1.toDec().gt(amount2.toDec())) {
          return -1;
        } else {
          return 1;
        }
      });

      return rewards
        .filter((reward) => {
          if (reward.reward) {
            for (const r of reward.reward) {
              const dec = new Dec(r.amount);
              if (dec.truncate().gt(new Int(0))) {
                return true;
              }
            }
          }

          return false;
        })
        .slice(0, maxValiadtors)
        .map((r) => r.validator_address);
    }
  );

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<Rewards>>
  ) {
    super.onReceiveResponse(response);

    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);
    const denoms = response.data.total.map((coin) => coin.denom);
    chainInfo.addUnknownDenoms({
      module: "cosmos",
      coinMinimalDenoms: denoms,
    });
  }
}

export class ObservableQueryRewards extends ObservableChainQueryMap<Rewards> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryRewardsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(bech32Address: string): ObservableQueryRewardsInner {
    return this.get(bech32Address) as ObservableQueryRewardsInner;
  }
}
