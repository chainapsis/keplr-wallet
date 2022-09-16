import { KVStore } from "@keplr-wallet/common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../common";
import { ClientStateResponse } from "./types";
import { autorun, computed } from "mobx";

export class ObservableChainQueryClientState extends ObservableChainQuery<ClientStateResponse> {
  protected disposer?: () => void;

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
      `/ibc/core/channel/v1beta1/channels/${channelId}/ports/${portId}/client_state`
    );
  }

  protected onStart() {
    super.onStart();

    return new Promise<void>((resolve) => {
      this.disposer = autorun(() => {
        const chainInfo = this.chainGetter.getChain(this.chainId);
        if (chainInfo.features && chainInfo.features.includes("ibc-go")) {
          this.setUrl(
            `/ibc/core/channel/v1/channels/${this.channelId}/ports/${this.portId}/client_state`
          );
        }
        resolve();
      });
    });
  }

  protected onStop() {
    if (this.disposer) {
      this.disposer();
      this.disposer = undefined;
    }
    super.onStop();
  }

  /**
   * clientChainId returns the chain id of the client state if the client state's type is known (currently, only tendermint is supported).
   */
  @computed
  get clientChainId(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.identified_client_state?.client_state
      ?.chain_id as string | undefined;
  }
}

export class ObservableQueryIBCClientState extends ObservableChainQueryMap<ClientStateResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const params = JSON.parse(key);

      return new ObservableChainQueryClientState(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        params.portId,
        params.channelId
      );
    });
  }

  getClientStateOnTransferPort(
    channelId: string
  ): ObservableChainQueryClientState {
    return this.getClientState("transfer", channelId);
  }

  getClientState(
    portId: string,
    channelId: string
  ): ObservableChainQueryClientState {
    // Use key as the JSON encoded Object.
    const key = JSON.stringify({
      portId,
      channelId,
    });

    return this.get(key) as ObservableChainQueryClientState;
  }
}
