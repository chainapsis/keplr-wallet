import { ObservableQuery, QueryOptions } from "./query";
import { QuerySharedContext } from "./context";
import { MemoryKVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction } from "mobx";

export class MockObservableQuery extends ObservableQuery<string> {
  @observable.ref
  protected resolver:
    | {
        resolve: (res: { headers: any; data: string }) => void;
        reject: (e: Error) => void;
      }
    | undefined = undefined;

  constructor(
    sharedContext: QuerySharedContext,
    options: Partial<QueryOptions> = {}
  ) {
    super(sharedContext, "https://noop.org", "/nop", options);

    makeObservable(this);
  }

  changeURL(url: string) {
    this.setUrl(url);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: string }> {
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

  resolveResponse(res: { headers: any; data: string }) {
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

describe("Test Query store", () => {
  it("test basic query", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      })
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    const disposal = autorun(() => {
      if (store.response && store.response.data !== "0") {
        throw new Error();
      }
    });

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(true);

    await store.waitBeforeFetchResponse();
    store.resolveResponse({
      headers: {},
      data: "0",
    });
    await store.waitResponse();

    expect(store.isObserved).toBe(true);
    expect(store.isStarted).toBe(true);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");

    disposal();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitResponse()", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      })
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    store.waitBeforeFetchResponse().then(() => {
      store.resolveResponse({
        headers: {},
        data: "0",
      });
    });
    await store.waitResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitResponse() with observation disposed", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      })
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
            data: "0",
          });
        });
      }, 100);
    }, 100);
    await store.waitResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitFreshResponse()", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      })
    );

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    store.waitBeforeFetchResponse().then(() => {
      store.resolveResponse({
        headers: {},
        data: "0",
      });
    });
    await store.waitFreshResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");

    expect(spyAbort).toBeCalledTimes(0);
  });

  it("test basic waitFreshResponse() with observation disposed", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const store = new MockObservableQuery(
      new QuerySharedContext(new MemoryKVStore("test"), {
        responseDebounceMs: 10,
      })
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
            data: "0",
          });
        });
      }, 100);
    }, 100);
    await store.waitFreshResponse();

    expect(store.isObserved).toBe(false);
    expect(store.isStarted).toBe(false);
    expect(store.isFetching).toBe(false);

    expect(store.response?.data).toBe("0");

    expect(spyAbort).toBeCalledTimes(0);
  });
});
