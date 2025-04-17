import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { DenomTraceResponse, DenomTraceV2Response } from "./types";
import { autorun, computed } from "mobx";
import { QuerySharedContext } from "../../../common";

export class ObservableChainQueryDenomTrace extends ObservableChainQuery<
  DenomTraceResponse | DenomTraceV2Response
> {
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
      if (chainInfo.features) {
        if (chainInfo.features.includes("ibc-v2")) {
          this.setUrl(`/ibc/apps/transfer/v1/denoms/${this.hash}`);
        } else if (chainInfo.features.includes("ibc-go")) {
          this.setUrl(`/ibc/apps/transfer/v1/denom_traces/${this.hash}`);
        }
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

    if ("denom" in this.response.data) {
      return this.response.data.denom.trace.map((t) => {
        return {
          portId: t.port_id,
          channelId: t.channel_id,
        };
      });
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

    // 기존 ibc-go랑 ibc v2랑 섞이면 base denom 안에 path가 포함되어 버린다...;;
    const rawPathsInBaseDenom =
      this.response.data.denom_trace.base_denom.split("/");
    if (rawPathsInBaseDenom.length % 2 === 1) {
      for (let i = 0; i < rawPathsInBaseDenom.length; i += 2) {
        if (
          rawPathsInBaseDenom[i] === "transfer" &&
          i + 1 < rawPathsInBaseDenom.length
        ) {
          rawPathChunks.push(rawPathsInBaseDenom.slice(i, i + 2));
        }
      }
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

    if ("denom" in this.response.data) {
      return this.response.data.denom.base;
    }

    // 기존 ibc-go랑 ibc v2랑 섞이면 base denom 안에 path가 포함되어 버린다...;;
    const rawPathsInBaseDenom =
      this.response.data.denom_trace.base_denom.split("/");
    if (rawPathsInBaseDenom.length % 2 === 1) {
      for (let i = 0; i < rawPathsInBaseDenom.length; i += 2) {
        if (
          rawPathsInBaseDenom[i] === "transfer" &&
          i + 1 < rawPathsInBaseDenom.length
        ) {
          rawPathsInBaseDenom.shift();
          rawPathsInBaseDenom.shift();
        }
      }
      if (rawPathsInBaseDenom.length === 1 && rawPathsInBaseDenom[0]) {
        return rawPathsInBaseDenom[0];
      }
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

export class ObservableQueryDenomTrace extends ObservableChainQueryMap<
  DenomTraceResponse | DenomTraceV2Response
> {
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
