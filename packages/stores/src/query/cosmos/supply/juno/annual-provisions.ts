import { ChainGetter } from "../../../../chain";
import { ObservableChainQuery } from "../../../chain-query";
import { AnnualProvisions } from "./types";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { QuerySharedContext } from "../../../../common";

export class ObservableQueryJunoAnnualProvisions extends ObservableChainQuery<AnnualProvisions> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
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
