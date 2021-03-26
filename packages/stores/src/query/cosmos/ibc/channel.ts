import { KVStore } from "@keplr-wallet/common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../common";
import { ChannelResponse } from "./types";

export class ObservableQueryIBCChannel extends ObservableChainQueryMap<ChannelResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const params = JSON.parse(key);

      return new ObservableChainQuery<ChannelResponse>(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        `/ibc/core/channel/v1beta1/channels/${params.channelId}/ports/${params.portId}`
      );
    });
  }

  getTransferChannel(channelId: string) {
    return this.getChannel("transfer", channelId);
  }

  getChannel(
    portId: string,
    channelId: string
  ): ObservableChainQuery<ChannelResponse> {
    // Use key as the JSON encoded Object.
    const key = JSON.stringify({
      portId,
      channelId,
    });

    return this.get(key);
  }
}
