import { ObservableQuery, QueryOptions } from "./query";
import { QuerySharedContext } from "./context";
import { MemoryKVStore } from "@keplr-wallet/common";
import { autorun } from "mobx";

export class MockObservableQuery extends ObservableQuery<string> {
  protected count: number = 0;

  constructor(
    sharedContext: QuerySharedContext,
    options: Partial<QueryOptions> = {}
  ) {
    super(sharedContext, "https://noop.org", "/nop", options);
  }

  changeURL(url: string) {
    this.setUrl(url);
  }

  protected override async fetchResponse(
    _: AbortController
  ): Promise<{ headers: any; data: string }> {
    this.count++;
    return {
      headers: {},
      data: (this.count - 1).toString(),
    };
  }
}

describe("Test Query store", () => {
  it("test basic query", async () => {
    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 0,
      })
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    autorun(() => {
      if (store.response && store.response.data !== "0") {
        throw new Error();
      }
    });

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(true);

    await store.waitResponse();

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");
  });

  it("test basic waitResponse()", async () => {
    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 0,
      })
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    await store.waitResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");
  });

  it("test basic waitFreshResponse()", async () => {
    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 0,
      })
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    await store.waitFreshResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");
  });
});
