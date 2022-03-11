import { ObservableChainQuery } from "../../chain-query";
import { DistributionParams } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";

export class ObservableQueryDistributionParams extends ObservableChainQuery<DistributionParams> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/distribution/parameters");
  }
}
