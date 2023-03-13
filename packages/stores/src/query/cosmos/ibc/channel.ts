import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { ChannelResponse } from "./types";
import { autorun } from "mobx";
import { QuerySharedContext } from "../../../common";

export class ObservableChainQueryIBCChannel extends ObservableChainQuery<ChannelResponse> {
  protected disposer?: () => void;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly portId: string,
    protected readonly channelId: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/ibc/core/channel/v1beta1/channels/${channelId}/ports/${portId}`
    );
  }

  protected override onStart(): void {
    super.onStart();

    this.disposer = autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (chainInfo.features && chainInfo.features.includes("ibc-go")) {
        this.setUrl(
          `/ibc/core/channel/v1/channels/${this.channelId}/ports/${this.portId}`
        );
      }
    });
  }

  protected override onStop() {
    if (this.disposer) {
      this.disposer();
      this.disposer = undefined;
    }
    super.onStop();
  }
}

export class ObservableQueryIBCChannel extends ObservableChainQueryMap<ChannelResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (key: string) => {
      const params = JSON.parse(key);

      return new ObservableChainQueryIBCChannel(
        this.sharedContext,
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
