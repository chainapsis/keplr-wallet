import { ChainGetter } from "../../common";
import { makeObservable } from "mobx";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { VstorageResult } from "./types";
import { KVStore } from "@keplr-wallet/common";

class ObservableQueryBoardAuxInner extends ObservableChainQuery<VstorageResult> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    boardId: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/agoric/vstorage/data/published.boardAux.${boardId}`
    );

    makeObservable(this);
  }

  get data(): { body: any; slots: any } | undefined {
    if (!this.response) return undefined;

    const { value } = this.response.data;
    const parsedValue = JSON.parse(value);

    const latestValueStr =
      "values" in parsedValue
        ? parsedValue.values[parsedValue.values.length - 1]
        : parsedValue;

    return JSON.parse(latestValueStr);
  }
}

export class ObservableQueryBoardAux extends ObservableChainQueryMap<VstorageResult> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (boardId: string) => {
      return new ObservableQueryBoardAuxInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        boardId
      );
    });
  }

  getBoardAux(boardId: string): ObservableQueryBoardAuxInner {
    return this.get(boardId) as ObservableQueryBoardAuxInner;
  }
}
