import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Block } from "@cosmjs/tendermint-rpc";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
import { Int } from "@keplr-wallet/unit";

export class ObservableQueryBlockInner extends ObservableChainQuery<{
  block: Block;
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly paramHeight: number | "latest"
  ) {
    super(kvStore, chainId, chainGetter, `/blocks/${paramHeight}`);

    makeObservable(this);
  }

  /**
   * Return the block height.
   * If fetching is not completed or failed, return the 0 Int.
   */
  @computed
  get height(): Int {
    if (!this.response) {
      return new Int("0");
    }

    return new Int(this.response.data.block.header.height);
  }
}

export class ObservableQueryBlock extends ObservableChainQueryMap<{
  block: Block;
}> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (height) => {
      const param: number | "latest" =
        height === "latest" ? height : parseInt(height);

      return new ObservableQueryBlockInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        param
      );
    });
  }

  getBlock(height: number | "latest"): ObservableQueryBlockInner {
    return this.get(height.toString()) as ObservableQueryBlockInner;
  }
}
