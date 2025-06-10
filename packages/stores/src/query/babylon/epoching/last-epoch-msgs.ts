import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";
import { EpochMessage, LatestEpochMessagesResponse } from "./types";

export class ObservableQueryBabylonLastEpochMsgsInner extends ObservableChainQuery<LatestEpochMessagesResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/babylon/epoching/v1/epochs:latest/messages?epoch_count=1"
    );

    makeObservable(this);
  }

  @computed
  get msgs(): EpochMessage[] {
    if (!this.response || !this.response.data.latest_epoch_msgs) {
      return [];
    }
    return this.response.data.latest_epoch_msgs[0].msgs;
  }
}

export class ObservableQueryBabylonLastEpochMsgs extends ObservableChainQueryMap<LatestEpochMessagesResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, () => {
      return new ObservableQueryBabylonLastEpochMsgsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter
      );
    });
  }

  getQuery(): ObservableQueryBabylonLastEpochMsgsInner {
    return this.get(
      "babylon-last-epoch-msgs"
    ) as ObservableQueryBabylonLastEpochMsgsInner;
  }
}
