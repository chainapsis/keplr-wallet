import { ChainGetter } from "../../../../common";
import { ObservableChainQuery } from "../../../chain-query";
import { AnnualProvisions } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

export class ObservableQueryJunoAnnualProvisions extends ObservableChainQuery<AnnualProvisions> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/cosmos/mint/v1beta1/annual_provisions"
    );

    makeObservable(this);
  }

  @computed
  get annualProvisions(): CoinPretty | undefined {
    if (!this.response) {
      return;
    }

    const chainInfo = this.chainGetter.getChain(this.chainId);

    return new CoinPretty(
      chainInfo.stakeCurrency,
      new Dec(this.response.data.annual_provisions)
    );
  }

  @computed
  get annualProvisionsRaw(): Dec | undefined {
    if (!this.response) {
      return;
    }

    return new Dec(this.response.data.annual_provisions);
  }
}
