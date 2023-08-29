import {
  ChainStore,
  QueriesStore,
  AccountStore,
  CosmosAccount,
  CosmosQueries,
} from "@keplr-wallet/stores";
import { IndexedDBKVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { EmbedChainInfos } from "../config";
import { getWCKeplr } from "../get-wc-keplr";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<[CosmosQueries]>;
  public readonly accountStore: AccountStore<[CosmosAccount]>;

  constructor() {
    this.chainStore = new ChainStore<ChainInfo>(EmbedChainInfos);

    this.queriesStore = new QueriesStore(
      new IndexedDBKVStore("store_queries"),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      CosmosQueries.use()
    );

    this.accountStore = new AccountStore(
      window,
      this.chainStore,
      getWCKeplr,
      () => {
        return {
          suggestChain: false,
          autoInit: true,
          getKeplr: getWCKeplr,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
      })
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
