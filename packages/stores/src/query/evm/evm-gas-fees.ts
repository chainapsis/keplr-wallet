import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { ChainGetter, ObservableJsonRPCQuery } from "../../common";
import { EtherscanGasFeeResponse } from "./types";
import { BigNumber } from "@ethersproject/bignumber";

export class ObservableQueryEvmGasPrice extends ObservableJsonRPCQuery<EtherscanGasFeeResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      Axios.create({
        ...{
          baseURL: chainGetter.getChain(chainId).rpc,
        },
      }),
      "",
      "eth_gasPrice",
      [],
      { fetchingInterval: 15000 }
    );

    makeObservable(this);
  }

  @computed
  get gasPrice(): string | undefined {
    console.log(this.response);
    if (!this.response || !this.response.data || !this.response.data) {
      return undefined;
    }

    return BigNumber.from(this.response.data).toString();
  }
}
