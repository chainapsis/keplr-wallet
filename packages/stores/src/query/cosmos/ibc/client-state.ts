import { KVStore } from "@keplr-wallet/common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../common";
import { ClientStateResponse } from "./types";

export class ObservableQueryIBCClientState extends ObservableChainQueryMap<ClientStateResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const params = JSON.parse(key);

      return new ObservableChainQuery<ClientStateResponse>(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        `/ibc/core/channel/v1beta1/channels/${params.channelId}/ports/${params.portId}/client_state`
      );
    });
  }

  getClientStateOnTransferPort(
    channelId: string
  ): ObservableChainQuery<ClientStateResponse> {
    return this.getClientState("transfer", channelId);
  }

  getClientState(
    portId: string,
    channelId: string
  ): ObservableChainQuery<ClientStateResponse> {
    // Use key as the JSON encoded Object.
    const key = JSON.stringify({
      portId,
      channelId,
    });

    return this.get(key);
  }
}
