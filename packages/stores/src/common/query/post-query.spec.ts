import {
  ObservablePostQuery,
  ObservablePostQueryMap,
  PostRequestOptions,
} from "./post-query";
import { QuerySharedContext } from "./context";
import { MemoryKVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction } from "mobx";

interface TestData {
  message: string;
  timestamp: number;
}

interface TestBody {
  query: string;
  params?: any;
}

const TEST_BASE_URL = "https://httpbin.org";
const TEST_URL = "/post";

export class MockObservablePostQuery extends ObservablePostQuery<
  TestData,
  Error,
  TestBody
> {
  @observable.ref
  protected resolver:
    | {
        resolve: (res: { headers: any; data: TestData }) => void;
        reject: (e: Error) => void;
      }
    | undefined = undefined;

  constructor(
    sharedContext: QuerySharedContext,
    body?: TestBody,
    postOptions: PostRequestOptions = {},
    options: Partial<any> = {}
  ) {
    super(sharedContext, TEST_BASE_URL, TEST_URL, body, postOptions, options);

    makeObservable(this);
  }

  changeURL(url: string) {
    this.setUrl(url);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: TestData }> {
    abortController.signal.onabort = () => {
      if (this.resolver) {
        runInAction(() => {
          this.resolver = undefined;
        });
      }
    };

    return new Promise((resolve, reject) => {
      runInAction(() => {
        this.resolver = {
          resolve,
          reject,
        };
      });
    });
  }

  waitBeforeFetchResponse() {
    return new Promise<void>((resolve) => {
      const disposal = autorun(
        () => {
          if (this.resolver) {
            resolve();
            if (disposal) {
              disposal();
            }
          }
        },
        {
          delay: 10,
        }
      );
    });
  }

  resolveResponse(res: { headers: any; data: TestData }) {
    if (!this.resolver) {
      throw new Error("Resolver is not set");
    }

    this.resolver.resolve(res);
    runInAction(() => {
      this.resolver = undefined;
    });
  }

  rejectResponse(e: Error) {
    if (!this.resolver) {
      throw new Error("Resolver is not set");
    }

    this.resolver.reject(e);
    runInAction(() => {
      this.resolver = undefined;
    });
  }
}

class TestObservablePostQueryMap<
  T = unknown,
  E = unknown,
  Body = unknown
> extends ObservablePostQueryMap<T, E, Body> {
  public getQuery(key: string): ObservablePostQuery<T, E, Body> {
    return this.get(key);
  }

  public hasQuery(key: string): boolean {
    return this.has(key);
  }
}

describe("Test ObservablePostQuery", () => {
  it("test basic post query", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const testBody: TestBody = { query: "test", params: { limit: 10 } };
    const store = new MockObservablePostQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      }),
      testBody
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    const disposal = autorun(() => {
      if (store.response && store.response.data.message !== "success") {
        throw new Error();
      }
    });

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(true);

    await store.waitBeforeFetchResponse();
    store.resolveResponse({
      headers: { "content-type": "application/json" },
      data: { message: "success", timestamp: Date.now() },
    });
    await store.waitResponse();

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data.message).toBe("success");

    disposal();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data.message).toBe("success");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitResponse()", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const testBody: TestBody = { query: "wait-test" };
    const store = new MockObservablePostQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      }),
      testBody
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    store.waitBeforeFetchResponse().then(() => {
      store.resolveResponse({
        headers: {},
        data: { message: "wait-success", timestamp: Date.now() },
      });
    });
    await store.waitResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data.message).toBe("wait-success");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitResponse() with observation disposed", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const testBody: TestBody = { query: "disposed-test" };
    const store = new MockObservablePostQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      }),
      testBody
    );

    const disposal = autorun(() => {
      if (store.response) {
        throw new Error();
      }
    });

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(true);

    setTimeout(() => {
      disposal();

      setTimeout(() => {
        store.waitBeforeFetchResponse().then(() => {
          store.resolveResponse({
            headers: {},
            data: { message: "disposed-success", timestamp: Date.now() },
          });
        });
      }, 100);
    }, 100);
    await store.waitResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data.message).toBe("disposed-success");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitFreshResponse()", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const testBody: TestBody = { query: "fresh-test" };
    const store = new MockObservablePostQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      }),
      testBody
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    store.waitBeforeFetchResponse().then(() => {
      store.resolveResponse({
        headers: {},
        data: { message: "fresh-success", timestamp: Date.now() },
      });
    });
    await store.waitFreshResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data.message).toBe("fresh-success");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitFreshResponse() with observation disposed", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const testBody: TestBody = { query: "fresh-disposed-test" };
    const store = new MockObservablePostQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      }),
      testBody
    );

    const disposal = autorun(() => {
      if (store.response) {
        throw new Error();
      }
    });

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(true);

    setTimeout(() => {
      disposal();

      setTimeout(() => {
        store.waitBeforeFetchResponse().then(() => {
          store.resolveResponse({
            headers: {},
            data: { message: "fresh-disposed-success", timestamp: Date.now() },
          });
        });
      }, 100);
    }, 100);
    await store.waitFreshResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data.message).toBe("fresh-disposed-success");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test cache key generation with body", () => {
    const sharedContext = new QuerySharedContext(new MemoryKVStore("test"), {
      responseDebounceMs: 10,
    });

    // Case without body
    const storeWithoutBody = new MockObservablePostQuery(sharedContext);
    const cacheKeyWithoutBody = (storeWithoutBody as any).getCacheKey();
    expect(cacheKeyWithoutBody).toContain("-post");

    // Case with body
    const storeWithBody = new MockObservablePostQuery(sharedContext, {
      query: "test",
      params: { id: 123 },
    });
    const cacheKeyWithBody = (storeWithBody as any).getCacheKey();
    expect(cacheKeyWithBody).toContain("-post-");
    expect(cacheKeyWithBody).not.toBe(cacheKeyWithoutBody);

    // Generate different cache key with different body
    const storeWithDifferentBody = new MockObservablePostQuery(sharedContext, {
      query: "different",
      params: { id: 456 },
    });
    const cacheKeyWithDifferentBody = (
      storeWithDifferentBody as any
    ).getCacheKey();
    expect(cacheKeyWithDifferentBody).not.toBe(cacheKeyWithBody);
  });
});

describe("Test ObservablePostQueryMap", () => {
  it("test post query map creation", () => {
    const sharedContext = new QuerySharedContext(new MemoryKVStore("test"), {
      responseDebounceMs: 10,
    });

    const queryMap = new TestObservablePostQueryMap<TestData, Error, TestBody>(
      (key: string) => {
        return new MockObservablePostQuery(
          sharedContext,
          { query: key },
          { contentType: "application/json" }
        );
      }
    );

    // 1. First query creation
    const query1 = queryMap.getQuery("test1");
    expect(query1).toBeDefined();

    // 2. Same key access returns the same instance
    const query1Again = queryMap.getQuery("test1");
    expect(query1).toBe(query1Again);

    // 3. New query creation with different key
    const query2 = queryMap.getQuery("test2");
    expect(query2).not.toBe(query1);
    expect(query2).toBeDefined();
  });
});
