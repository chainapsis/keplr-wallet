import { ChainGetter } from "../../../../common";
import { ObservableChainQuery } from "../../../chain-query";
import { MintParmas } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { Dec } from "@keplr-wallet/unit";

export class ObservableQueryOsmosisMintParmas extends ObservableChainQuery<MintParmas> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/osmosis/mint/v1beta1/params`);

    makeObservable(this);
  }

  get mintDenom(): string | undefined {
    return this.response?.data.params.mint_denom;
  }

  get epochIdentifier(): string | undefined {
    return this.response?.data.params.epoch_identifier;
  }

  @computed
  get distributionProportions(): {
    staking: Dec;
    poolIncentives: Dec;
    developerRewards: Dec;
  } {
    if (!this.response) {
      return {
        staking: new Dec(0),
        poolIncentives: new Dec(0),
        developerRewards: new Dec(0),
      };
    }

    return {
      staking: new Dec(
        this.response.data.params.distribution_proportions.staking
      ),
      poolIncentives: new Dec(
        this.response.data.params.distribution_proportions.pool_incentives
      ),
      developerRewards: new Dec(
        this.response.data.params.distribution_proportions.developer_rewards
      ),
    };
  }
}
