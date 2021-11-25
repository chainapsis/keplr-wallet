import { KVStore } from "@keplr-wallet/common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../common";
import { ChannelResponse } from "./types";
import { autorun } from "mobx";

export class ObservableChainQueryIBCChannel extends ObservableChainQuery<ChannelResponse> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly portId: string,
    protected readonly channelId: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/ibc/core/channel/v1beta1/channels/${channelId}/ports/${portId}`
    );

    autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (chainInfo.features && chainInfo.features.includes("ibc-go")) {
        this.setUrl(
          `/ibc/core/channel/v1/channels/${this.channelId}/ports/${this.portId}`
        );
      }
    });
  }
}

export class ObservableQueryIBCChannel extends ObservableChainQueryMap<ChannelResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const params = JSON.parse(key);

      return new ObservableChainQueryIBCChannel(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        params.portId,
        params.channelId
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
