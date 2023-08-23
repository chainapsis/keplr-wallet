import { ChainGetter } from "../../chain";
import { makeObservable } from "mobx";
import { QuerySharedContext } from "../../common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { VstorageResult } from "./types";

class ObservableQueryBoardAuxInner extends ObservableChainQuery<VstorageResult> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    boardId: string
  ) {
    super(
      sharedContext,
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
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (boardId: string) => {
      return new ObservableQueryBoardAuxInner(
        this.sharedContext,
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
