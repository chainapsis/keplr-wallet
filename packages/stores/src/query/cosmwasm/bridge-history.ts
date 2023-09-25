import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { ChainGetter, HasMapStore, ObservableJsonRPCQuery } from "../../common";
import { BridgeHistory } from "../../common/types";
import { ObservableQueryNativeFetCosmosBridge } from "./native-fet-bridge";
import { Tx } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
Tx;
export class ObservableBridgeHistoryInner extends ObservableJsonRPCQuery<any> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    protected readonly nativeBridge: ObservableQueryNativeFetCosmosBridge,
    protected readonly bech32Address: string
  ) {
    const fetchhubUrl = chainGetter.getChain("fetchhub-4").rpc;

    const instance = Axios.create({
      ...{
        baseURL: fetchhubUrl,
      },
    });

    super(kvStore, instance, "", "tx_search", [
      `wasm._contract_address='${nativeBridge.nativeBridgeAddress}' AND wasm.action='swap' AND message.sender='${bech32Address}'`,
      false,
      "1",
      "3000",
      "asc",
    ]);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }

  @computed
  get history(): BridgeHistory[] {
    console.log("$$$$$", this.error);
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data.txs.map((tx: any): BridgeHistory => {
      const wasmData = JSON.parse(tx.tx_result.log)[0].events.find(
        (e: any) => e.type === "wasm"
      );

      return {
        to: wasmData.attributes.find((a: any) => a.key === "destination").value,
        amount: wasmData.attributes.find((a: any) => a.key === "amount").value,
        swapId: wasmData.attributes.find((a: any) => a.key === "swap_id").value,
        transactionHash: tx.hash,
      };
    });
  }
}

export class ObservableQueryBridgeHistory extends HasMapStore<ObservableBridgeHistoryInner> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    nativeBridge: ObservableQueryNativeFetCosmosBridge
  ) {
    super((bech32address) => {
      return new ObservableBridgeHistoryInner(
        kvStore,
        chainGetter,
        nativeBridge,
        bech32address
      );
    });
  }

  getBridgeHistory(bech32address: string): ObservableBridgeHistoryInner {
    return super.get(bech32address);
  }
}
