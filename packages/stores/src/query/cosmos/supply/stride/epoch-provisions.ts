import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../../chain";
import { ObservableChainQuery } from "../../../chain-query";
import { EpochProvisions } from "../types";
import { QuerySharedContext } from "../../../../common";

export class ObservableQueryStrideEpochProvisions extends ObservableChainQuery<EpochProvisions> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/mint/v1beta1/epoch_provisions`
    );

    makeObservable(this);
  }

  @computed
  get epochProvisions(): CoinPretty {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!this.response) {
      return new CoinPretty(chainInfo.stakeCurrency, new Int(0));
    }

    let provision = this.response.data.epoch_provisions;
    if (provision.includes(".")) {
      provision = provision.slice(0, provision.indexOf("."));
    }
    return new CoinPretty(chainInfo.stakeCurrency, new Int(provision));
  }
}
