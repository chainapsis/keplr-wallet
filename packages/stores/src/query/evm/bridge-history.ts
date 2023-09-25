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
import { BridgeHistory } from "../../common/types";
import { BigNumber } from "@ethersproject/bignumber";
import { ObservableQueryNativeFetEthBrige } from "./native-fet-bridge";
import { Bech32Address } from "@keplr-wallet/cosmos";

export class ObservableBridgeHistoryInner extends ObservableJsonRPCQuery<
  NativeBridgeLogResponse[]
> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly nativeBridge: ObservableQueryNativeFetEthBrige,
    protected readonly bech32Address: string
  ) {
    const ethereumURL = chainGetter.getChain("1").rpc;

    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    const ethereumHexAddress = bech32Address
      ? Bech32Address.fromBech32(
          bech32Address,
          chainGetter.getChain(chainId).bech32Config.bech32PrefixAccAddr
        ).toHex(true)
      : "0x0000000000000000000000000000000000000000";

    super(kvStore, instance, "", "eth_getLogs", [
      {
        address: nativeBridge.nativeBridgeAddress,
        topics: nativeFetBridgeInterface.encodeFilterTopics("Swap", [
          null,
          ethereumHexAddress,
        ]),
        fromBlock: BigNumber.from("12130113").toHexString(),
        toBlock: "pending",
      },
    ]);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }

  @computed
  get history(): BridgeHistory[] {
    if (!this.response) {
      return [];
    }

    return this.response.data
      .filter((d) => !d.removed)
      .map((d): BridgeHistory => {
        const eventArgs = nativeFetBridgeInterface.parseLog({
          data: d.data,
          topics: d.topics,
        }).args;
        return {
          to: eventArgs[3],
          amount: eventArgs[4].toString(),
          swapId: eventArgs[0].toString(),
          transactionHash: d.transactionHash,
        };
      });
  }
}

export class ObservableQueryBridgeHistory extends HasMapStore<ObservableBridgeHistoryInner> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    nativeBridge: ObservableQueryNativeFetEthBrige
  ) {
    super((bech32address) => {
      return new ObservableBridgeHistoryInner(
        kvStore,
        chainId,
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
