import { ChainGetter } from "../../../../chain";
import { ObservableChainQuery } from "../../../chain-query";
import { EpochProvisions } from "../types";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { ObservableQueryOsmosisMintParmas } from "./params";
import { QuerySharedContext } from "../../../../common";

export class ObservableQueryOsmosisEpochProvisions extends ObservableChainQuery<EpochProvisions> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryMintParmas: ObservableQueryOsmosisMintParmas
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/osmosis/mint/v1beta1/epoch_provisions`
    );

    makeObservable(this);
  }

  @computed
  get epochProvisions(): CoinPretty | undefined {
    if (!this.response || !this.queryMintParmas.mintDenom) {
      return;
    }

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(
      (cur) => cur.coinMinimalDenom === this.queryMintParmas.mintDenom
    );
    if (!currency) {
      throw new Error("Unknown currency");
    }

    let provision = this.response.data.epoch_provisions;
    if (provision.includes(".")) {
      provision = provision.slice(0, provision.indexOf("."));
    }
    return new CoinPretty(currency, new Int(provision));
  }
}
