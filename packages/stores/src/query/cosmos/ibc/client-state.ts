import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { ClientStateResponse } from "./types";
import { autorun, computed } from "mobx";
import { QuerySharedContext } from "../../../common";

export class ObservableChainQueryClientState extends ObservableChainQuery<ClientStateResponse> {
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
      `/ibc/core/channel/v1beta1/channels/${channelId}/ports/${portId}/client_state`
    );
  }

  protected override onStart(): void {
    super.onStart();

    this.disposer = autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (chainInfo.features && chainInfo.features.includes("ibc-go")) {
        this.setUrl(
          `/ibc/core/channel/v1/channels/${this.channelId}/ports/${this.portId}/client_state`
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

  /**
   * clientChainId returns the chain id of the client state if the client state's type is known (currently, only tendermint is supported).
   */
  @computed
  get clientChainId(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.identified_client_state?.client_state?.[
      "chain_id"
    ] as string | undefined;
  }
}

export class ObservableQueryIBCClientState extends ObservableChainQueryMap<ClientStateResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (key: string) => {
      const params = JSON.parse(key);

      return new ObservableChainQueryClientState(
        this.sharedContext,
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
