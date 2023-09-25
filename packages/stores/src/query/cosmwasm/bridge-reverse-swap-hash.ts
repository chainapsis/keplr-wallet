import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { ChainGetter, HasMapStore, ObservableJsonRPCQuery } from "../../common";
import { ObservableQueryNativeFetCosmosBridge } from "./native-fet-bridge";
import { Tx } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
Tx;
export class ObservableBridgeReverseSwapHashInner extends ObservableJsonRPCQuery<any> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    protected readonly nativeBridge: ObservableQueryNativeFetCosmosBridge,
    protected readonly swapId: string
  ) {
    const fetchhubUrl = chainGetter.getChain("fetchhub-4").rpc;

    const instance = Axios.create({
      ...{
        baseURL: fetchhubUrl,
      },
    });

    super(kvStore, instance, "", "tx_search", [
      `wasm._contract_address='${nativeBridge.nativeBridgeAddress}' AND wasm.action='reverse_swap' AND wasm.rid='${swapId}'`,
      false,
      "1",
      "3000",
      "asc",
    ]);

    makeObservable(this);
  }

  @computed
  get hash(): string | null {
    if (!this.response || !this.response.data || this.response.data.txs === 0) {
      return null;
    }

    const txs = this.response.data.txs.filter(
      (tx: any) => tx.tx_result && tx.tx_result.code === 0
    );

    if (txs.length === 0) {
      return null;
    }

    return this.response.data.txs[0].hash;
  }
}

export class ObservableQueryBridgeReverseSwapHash extends HasMapStore<ObservableBridgeReverseSwapHashInner> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    nativeBridge: ObservableQueryNativeFetCosmosBridge
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
