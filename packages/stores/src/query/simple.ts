import {
  ObservableQuery,
  ObservableQueryMap,
  QuerySharedContext,
} from "../common";

export class ObservableSimpleQueryImpl<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(sharedContext: QuerySharedContext, url: string) {
    super(sharedContext, url, "");
  }
}

export class ObservableSimpleQuery extends ObservableQueryMap<ObservableQuery> {
  constructor(protected readonly sharedContext: QuerySharedContext) {
    super((url) => {
      return new ObservableSimpleQueryImpl(sharedContext, url);
    });
  }

  queryGet<T = unknown, E = unknown>(url: string) {
    return this.get(url) as ObservableSimpleQueryImpl<T, E>;
  }
}
