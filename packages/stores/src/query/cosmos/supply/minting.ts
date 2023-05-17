import { ObservableChainQuery } from "../../chain-query";
import { MintingInflation } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";

export class ObservableQueryMintingInfation extends ObservableChainQuery<MintingInflation> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/cosmos/mint/v1beta1/inflation");
  }
}
