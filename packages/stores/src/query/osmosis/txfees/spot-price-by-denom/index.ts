import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../../chain-query";
import { ChainGetter } from "../../../../chain";
import { computed, makeObservable } from "mobx";
import { SpotPriceByDenom } from "./types";
import { Dec } from "@keplr-wallet/unit";
import { QuerySharedContext } from "../../../../common";

export class ObservableQueryTxFeesSpotPriceByDenomInner extends ObservableChainQuery<SpotPriceByDenom> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denom: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `osmosis/txfees/v1beta1/spot_price_by_denom?denom=${denom}`
    );

    makeObservable(this);
  }

  get poolId(): string {
    if (!this.response) {
      return "";
    }

    return this.response.data.poolID;
  }

  @computed
  get spotPriceDec(): Dec {
    if (!this.response) {
      return new Dec(0);
    }

    return new Dec(this.response.data.spot_price);
  }
}

export class ObservableQueryTxFeesSpotPriceByDenom extends ObservableChainQueryMap<SpotPriceByDenom> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (denom: string) => {
      return new ObservableQueryTxFeesSpotPriceByDenomInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  getQueryDenom(denom: string): ObservableQueryTxFeesSpotPriceByDenomInner {
    return this.get(denom) as ObservableQueryTxFeesSpotPriceByDenomInner;
  }
}
