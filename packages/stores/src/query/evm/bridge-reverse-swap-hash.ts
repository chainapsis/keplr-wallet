import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import {
  ChainGetter,
  HasMapStore,
  ObservableJsonRPCQuery,
  nativeFetBridgeInterface,
} from "../../common";
import { NativeBridgeLogResponse } from "./types";
import { BigNumber } from "@ethersproject/bignumber";
import { ObservableQueryNativeFetEthBrige } from "./native-fet-bridge";

export class ObservableBridgeReverseSwapHashInner extends ObservableJsonRPCQuery<
  NativeBridgeLogResponse[]
> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    protected readonly nativeBridge: ObservableQueryNativeFetEthBrige,
    protected readonly swapId: string
  ) {
    const ethereumURL = chainGetter.getChain("1").rpc;

    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_getLogs", [
      {
        address: nativeBridge.nativeBridgeAddress,
        topics: nativeFetBridgeInterface.encodeFilterTopics("ReverseSwap", [
          swapId,
        ]),
        fromBlock: BigNumber.from("12130113").toHexString(),
        toBlock: "pending",
      },
    ]);

    makeObservable(this);
  }

  @computed
  get hash(): string | null {
    if (!this.response || this.response.data.length === 0) {
      return null;
    }

    const events = this.response.data.filter((d) => !d.removed);

    if (events.length === 0) {
      return null;
    }

    return events[0].transactionHash;
  }
}

export class ObservableQueryBridgeReverseSwapHash extends HasMapStore<ObservableBridgeReverseSwapHashInner> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    nativeBridge: ObservableQueryNativeFetEthBrige
  ) {
    super((swapId) => {
      return new ObservableBridgeReverseSwapHashInner(
        kvStore,
        chainGetter,
        nativeBridge,
        swapId
      );
    });
  }

  getReverseSwapHash(swapId: string): ObservableBridgeReverseSwapHashInner {
    return super.get(swapId);
  }
}
