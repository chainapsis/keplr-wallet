import { ObservableQuery, ObservableQueryMap } from "../common";
import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";

export class ObservableSimpleQueryImpl<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, url: string) {
    const instance = Axios.create({
      ...{
        baseURL: url,
      },
    });

    super(kvStore, instance, url);
  }
}

export class ObservableSimpleQuery extends ObservableQueryMap {
  constructor(protected readonly kvStore: KVStore) {
    super((url) => {
      return new ObservableSimpleQueryImpl(kvStore, url);
    });
  }

  queryGet<T = unknown, E = unknown>(url: string) {
    return this.get(url) as ObservableSimpleQueryImpl<T, E>;
  }
}
