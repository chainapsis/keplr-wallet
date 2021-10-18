import {
  ChainStore,
  QueriesStore,
  AccountStore,
  QueriesWithCosmos,
  AccountWithCosmos,
} from "@keplr-wallet/stores";
import { IndexedDBKVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { getWCKeplr } from "../get-wc-keplr";
import { EmbedChainInfos } from "../config";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<QueriesWithCosmos>;
  public readonly accountStore: AccountStore<AccountWithCosmos>;

  constructor() {
    this.chainStore = new ChainStore<ChainInfo>(EmbedChainInfos);

    this.queriesStore = new QueriesStore(
      new IndexedDBKVStore("store_queries"),
      this.chainStore,
      getWCKeplr,
      QueriesWithCosmos
    );

    this.accountStore = new AccountStore(
      window,
      AccountWithCosmos,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          prefetching: false,
          suggestChain: false,
          autoInit: true,
          getKeplr: getWCKeplr,
        },
      }
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
