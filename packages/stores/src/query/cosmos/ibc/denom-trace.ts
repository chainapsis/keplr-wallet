import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { DenomTraceResponse } from "./types";
import { autorun, computed } from "mobx";
import { QuerySharedContext } from "../../../common";

export class ObservableChainQueryDenomTrace extends ObservableChainQuery<DenomTraceResponse> {
  protected disposer?: () => void;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly hash: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/ibc/applications/transfer/v1beta1/denom_traces/${hash}`
    );
  }

  protected override onStart(): void {
    super.onStart();

    this.disposer = autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (chainInfo.features && chainInfo.features.includes("ibc-go")) {
        this.setUrl(`/ibc/apps/transfer/v1/denom_traces/${this.hash}`);
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

  @computed
  get paths(): {
    portId: string;
    channelId: string;
  }[] {
    if (!this.response) {
      return [];
    }

    const rawPaths = this.response.data.denom_trace.path.split("/");

    if (rawPaths.length % 2 !== 0) {
      console.log("Failed to parse paths", rawPaths);
      return [];
    }

    const rawPathChunks: string[][] = [];
    for (let i = 0; i < rawPaths.length; i += 2) {
      rawPathChunks.push(rawPaths.slice(i, i + 2));
    }

    return rawPathChunks.map((chunk) => {
      return {
        portId: chunk[0],
        channelId: chunk[1],
      };
    });
  }

  get denom(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.denom_trace.base_denom;
  }

  @computed
  get denomTrace():
    | {
        denom: string;
        paths: {
          portId: string;
          channelId: string;
        }[];
      }
    | undefined {
    if (!this.response || !this.denom) {
      return undefined;
    }

    return {
      denom: this.denom,
      paths: this.paths,
    };
  }
}

export class ObservableQueryDenomTrace extends ObservableChainQueryMap<DenomTraceResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (hash: string) => {
      return new ObservableChainQueryDenomTrace(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        hash
      );
    });
  }

  getDenomTrace(hash: string): ObservableChainQueryDenomTrace {
    return this.get(hash) as ObservableChainQueryDenomTrace;
  }
}
