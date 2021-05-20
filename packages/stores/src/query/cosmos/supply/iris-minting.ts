import { ObservableChainQuery } from "../../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";

export class ObservableQueryIrisMintingInfation extends ObservableChainQuery<{
  height: string;
  result: {
    mint_denom: string;
    // Dec
    inflation: string;
  };
}> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/mint/params");
  }
}
