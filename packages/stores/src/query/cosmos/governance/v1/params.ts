import { ObservableChainQuery } from "../../../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../../common";
import {
  GovV1ParamsTally,
  GovV1ParamsVoting,
  GovV1ParamsDeposit,
} from "./types";

export class ObservableQueryGovV1ParamTally extends ObservableChainQuery<GovV1ParamsTally> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/cosmos/gov/v1/params/tallying`);
  }
}

export class ObservableQueryGovV1ParamVoting extends ObservableChainQuery<GovV1ParamsVoting> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/cosmos/gov/v1/params/voting`);
  }
}

export class ObservableQueryGovV1ParamDeposit extends ObservableChainQuery<GovV1ParamsDeposit> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/cosmos/gov/v1/params/deposit`);
  }
}
