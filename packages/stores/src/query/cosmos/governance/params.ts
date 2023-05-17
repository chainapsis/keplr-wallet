import { ObservableChainQuery } from "../../chain-query";
import { GovParamsDeposit, GovParamsTally, GovParamsVoting } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";

export class ObservableQueryGovParamTally extends ObservableChainQuery<GovParamsTally> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/cosmos/gov/v1beta1/params/tallying`);
  }
}

export class ObservableQueryGovParamVoting extends ObservableChainQuery<GovParamsVoting> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/cosmos/gov/v1beta1/params/voting`);
  }
}

export class ObservableQueryGovParamDeposit extends ObservableChainQuery<GovParamsDeposit> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/cosmos/gov/v1beta1/params/deposit`);
  }
}
