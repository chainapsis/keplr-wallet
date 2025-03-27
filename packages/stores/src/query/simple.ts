import {
  ObservableQuery,
  ObservableQueryMap,
  QuerySharedContext,
} from "../common";

export class ObservableSimpleQueryImpl<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(sharedContext: QuerySharedContext, baseURL: string, url: string) {
    super(sharedContext, baseURL, url);
  }

  override canFetch(): boolean {
    if (!this.baseURL) {
      return false;
    }
    return true;
  }
}

export class ObservableSimpleQuery extends ObservableQueryMap<ObservableQuery> {
  constructor(protected readonly sharedContext: QuerySharedContext) {
    super((key: string) => {
      const { baseURL, url } = JSON.parse(key);
      return new ObservableSimpleQueryImpl(sharedContext, baseURL, url || "");
    });
  }

  queryGet<T = unknown, E = unknown>(baseURL: string, url?: string) {
    return this.get(
      JSON.stringify({
        baseURL: removeLastSlashIfIs(baseURL),
        url: url != null ? removeFirstSlashIfIs(url) : undefined,
      })
    ) as ObservableSimpleQueryImpl<T, E>;
  }
}

function removeFirstSlashIfIs(str: string): string {
  if (str.length > 0 && str[0] === "/") {
    return str.slice(1);
  }

  return str;
}

function removeLastSlashIfIs(str: string): string {
  if (str.length > 0 && str[str.length - 1] === "/") {
    return str.slice(0, str.length - 1);
  }

  return str;
}
