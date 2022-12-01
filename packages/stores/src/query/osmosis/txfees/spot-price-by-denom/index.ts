import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../../common";
import { computed, makeObservable } from "mobx";
import { SpotPriceByDenom } from "./types";
import { Dec } from "@keplr-wallet/unit";

export class ObservableQueryTxFeesSpotPriceByDenomInner extends ObservableChainQuery<SpotPriceByDenom> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denom: string
  ) {
    super(
      kvStore,
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
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (denom: string) => {
      return new ObservableQueryTxFeesSpotPriceByDenomInner(
        this.kvStore,
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
