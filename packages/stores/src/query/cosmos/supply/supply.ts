import { SupplyTotal, SupplyTotalStargate } from "./types";
import { KVStore } from "@keplr-wallet/common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../common";
import { autorun } from "mobx";

export class ObservableChainQuerySupplyTotal extends ObservableChainQuery<
  SupplyTotal | SupplyTotalStargate
> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denom: string
  ) {
    super(kvStore, chainId, chainGetter, `/supply/total/${denom}`);

    autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (chainInfo.features && chainInfo.features.includes("stargate")) {
        const url = `/bank/total/${denom}`;

        this.setUrl(url);
      }
    });
  }
}

export class ObservableQuerySupplyTotal extends ObservableChainQueryMap<
  SupplyTotal | SupplyTotalStargate
> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (denom: string) => {
      return new ObservableChainQuerySupplyTotal(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  getQueryDenom(
    denom: string
  ): ObservableChainQuery<SupplyTotal | SupplyTotalStargate> {
    return this.get(denom);
  }

  getQueryStakeDenom(): ObservableChainQuery<
    SupplyTotal | SupplyTotalStargate
  > {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return this.get(chainInfo.stakeCurrency.coinMinimalDenom);
  }
}
