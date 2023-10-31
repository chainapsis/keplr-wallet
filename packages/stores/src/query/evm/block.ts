import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { ChainGetter, ObservableJsonRPCQuery } from "../../common";
import { BigNumber } from "@ethersproject/bignumber";

export class ObservableQueryLatestBlock extends ObservableJsonRPCQuery<string> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    const instance = Axios.create({
      ...{
        baseURL: chainGetter.getChain(chainId).rpc,
      },
    });

    super(kvStore, instance, "", "eth_blockNumber", []);

    makeObservable(this);
  }

  @computed
  get block(): string | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    return BigNumber.from(this.response.data).toString();
  }
}
