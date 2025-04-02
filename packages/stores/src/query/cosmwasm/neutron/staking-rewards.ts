import { ChainGetter } from "../../../chain";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { ObservableCosmwasmContractChainQuery } from "../contract-query";
import { QuerySharedContext } from "../../../common";
import { AppCurrency } from "@keplr-wallet/types";
import { ObservableChainQueryMap } from "../../chain-query";
import { computed } from "mobx";

interface NeutronStakingRewardsResponse {
  pending_rewards: {
    denom: string;
    amount: string;
  };
}

class ObservableQueryNeutronStakingRewardsInner extends ObservableCosmwasmContractChainQuery<NeutronStakingRewardsResponse> {
  //FIXME- mainnet 런칭시 해당 주소를 mainnet 주소로 변경
  public static readonly NEUTRON_REWARDS_CONTRACT_ADDRESS =
    "neutron1h62p45vv3fg2q6sm00r93gqgmhqt9tfgq5hz33qyrhq8f0pqqj0s36wgc3";

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      ObservableQueryNeutronStakingRewardsInner.NEUTRON_REWARDS_CONTRACT_ADDRESS,
      {
        rewards: { user: bech32Address },
      }
    );
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }

  @computed
  get pendingReward(): CoinPretty {
    if (!this.response?.data?.pending_rewards) {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      const defaultCurrency =
        chainInfo.stakeCurrency || chainInfo.currencies[0];

      if (!defaultCurrency) {
        console.error(`No currency found for chain ${this.chainId}`);
        const tempCurrency: AppCurrency = {
          coinDenom: "UNKNOWN",
          coinMinimalDenom: "unknown",
          coinDecimals: 0,
        };
        return new CoinPretty(tempCurrency, new Int(0)).ready(false);
      }
      return new CoinPretty(defaultCurrency, new Int(0)).ready(false);
    }

    const reward = this.response.data.pending_rewards;
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.findCurrency(reward.denom);

    if (!currency) {
      console.warn(
        `Unknown currency ${reward.denom} for chain ${this.chainId}`
      );
      const tempCurrency: AppCurrency = {
        coinDenom: reward.denom.toUpperCase(),
        coinMinimalDenom: reward.denom,
        coinDecimals: 0,
      };
      return new CoinPretty(tempCurrency, new Int(reward.amount)).ready(
        !this.isFetching
      );
    }

    return new CoinPretty(currency, new Int(reward.amount)).ready(
      !this.isFetching
    );
  }

  @computed
  get rewardCurrency(): AppCurrency | undefined {
    if (!this.response?.data?.pending_rewards) {
      return undefined;
    }
    const reward = this.response.data.pending_rewards;
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.findCurrency(reward.denom);
  }
}

export class ObservableQueryNeutronStakingRewards extends ObservableChainQueryMap<NeutronStakingRewardsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQueryNeutronStakingRewardsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getRewardFor(
    bech32Address: string
  ): ObservableQueryNeutronStakingRewardsInner {
    return this.get(bech32Address) as ObservableQueryNeutronStakingRewardsInner;
  }
}
