import { KVStore } from "../../../../common/kvstore";
import { ObservableChainQuery, ObservableChainQueryMap } from "./chain-query";
import { ChainGetter } from "./index";

export interface ChannelResponse {
  channel: {
    state:
      | "STATE_UNINITIALIZED_UNSPECIFIED"
      | "STATE_INIT"
      | "STATE_TRYOPEN"
      | "STATE_OPEN"
      | "STATE_CLOSED";
    ordering: "ORDER_NONE_UNSPECIFIED" | "ORDER_UNORDERED" | "ORDER_ORDERED";
    counterparty: {
      port_id: string;
      channel_id: string;
    };
    connection_hops: string[];
    version: string;
  };
  proof: string;
  proof_path: string;
  proof_height: {
    epoch_number: string;
    epoch_height: string;
  };
}

export class ObservableQueryIBCChannel extends ObservableChainQueryMap<
  ChannelResponse
> {
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
      channelId
    });

    return this.get(key);
  }
}
