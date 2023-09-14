import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { DeepReadonly } from "utility-types";

import { KVStore } from "@keplr-wallet/common";
import { ObservableQueryBoardAux } from "./board-aux";
import { ObservableQueryBrands } from "./brands";
import { ObservableQueryVbankAssets } from "./vbank-assets";

export interface AgoricQueries {
  agoric: AgoricQueriesImpl;
}

export const AgoricQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => AgoricQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        agoric: new AgoricQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class AgoricQueriesImpl {
  public readonly queryBoardAux: DeepReadonly<ObservableQueryBoardAux>;
  public readonly queryBrands: DeepReadonly<ObservableQueryBrands>;
  public readonly queryVbankAssets: DeepReadonly<ObservableQueryVbankAssets>;

  constructor(
    _: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryBoardAux = new ObservableQueryBoardAux(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryBrands = new ObservableQueryBrands(kvStore, chainId, chainGetter);
    this.queryVbankAssets = new ObservableQueryVbankAssets(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
