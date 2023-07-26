import { ChainGetter } from "../../chain";
import { makeObservable } from "mobx";
import { QuerySharedContext } from "../../common";
import { ObservableChainQueryRPC } from "../chain-rpc-query";
import { VstorageResult } from "./types";

export class ObservableQueryVbankAssets extends ObservableChainQueryRPC<VstorageResult> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      '/abci_query?path="custom/vstorage/data/published.agoricNames.vbankAsset"'
    );

    makeObservable(this);
  }

  get data(): { body: any; slots: any } | undefined {
    if (!this.response) return undefined;

    const { result } = this.response.data;
    if (result.response.code) {
      throw new Error(result.response.log);
    }

    const data = JSON.parse(window.atob(result.response.value));

    const value = JSON.parse(data.value);
    const latestValueStr =
      "values" in value ? value.values[value.values.length - 1] : value;

    return JSON.parse(latestValueStr);
  }
}
