import { ObservableChainQuery } from "../../../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../../common";
import { makeObservable } from "mobx";
import { BaseDenom } from "./types";

export class ObservableQueryTxFeesBaseDenom extends ObservableChainQuery<BaseDenom> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/osmosis/txfees/v1beta1/base_denom");

    makeObservable(this);
  }

  get baseDenom(): string {
    return this.response?.data.base_denom ?? "";
  }
}
