import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { ClientStateV2Response } from "./types";
import { computed } from "mobx";
import { QuerySharedContext } from "../../../common";
import { Buffer } from "buffer/";

export class ObservableChainQueryClientStateV2 extends ObservableChainQuery<ClientStateV2Response> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly channelId: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/ibc/core/client/v1/client_states/${channelId}`
    );
  }

  @computed
  get clientChainId(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      const decoded = Buffer.from(
        this.response.data.client_state.data,
        "base64"
      ).toString();
      const parsed = JSON.parse(decoded);
      if (parsed.chain_id) {
        return parsed.chain_id;
      }
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }
}

export class ObservableQueryIBCClientStateV2 extends ObservableChainQueryMap<ClientStateV2Response> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (channelId: string) => {
      return new ObservableChainQueryClientStateV2(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        channelId
      );
    });
  }

  getClientState(channelId: string): ObservableChainQueryClientStateV2 {
    return this.get(channelId) as ObservableChainQueryClientStateV2;
  }
}
