import {
  DeferInitialQueryController,
  ObservableQuery,
  ObservableQueryBase,
  QueryOptions,
} from "./query";
import { KVStore, MemoryKVStore } from "@keplr-wallet/common";
import Axios from "axios";
import Http from "http";
import { autorun } from "mobx";

export class MockObservableQuery extends ObservableQuery<number> {
  constructor(
    kvStore: KVStore,
    port: number,
    options: Partial<QueryOptions> = {},
    url: string = "/test"
  ) {
    const instance = Axios.create({
      baseURL: `http://127.0.0.1:${port}`,
    });

    super(kvStore, instance, url, options);
  }

  changeURL(url: string) {
    this.setUrl(url);
  }
}

export class MockOnStartObservableQuery extends ObservableQuery<number> {
  protected readonly onStartOptions: {
    readonly onStartDelay?: number;
    readonly onStartUrl?: string;
  };

  constructor(
    kvStore: KVStore,
    port: number,
    options: Partial<QueryOptions> = {},
    url: string = "/test",
    onStartOptions: {
      readonly onStartDelay?: number;
      readonly onStartUrl?: string;
    } = {}
  ) {
    const instance = Axios.create({
      baseURL: `http://127.0.0.1:${port}`,
    });

    super(kvStore, instance, url, options);

    this.onStartOptions = onStartOptions;
  }

  protected onStart() {
    super.onStart();

    if (this.onStartOptions.onStartDelay == null) {
      if (this.onStartOptions.onStartUrl) {
        this.setUrl(this.onStartOptions.onStartUrl);
      }
    } else {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          if (this.onStartOptions.onStartUrl) {
            this.setUrl(this.onStartOptions.onStartUrl);
          }

          setTimeout(() => {
            resolve();
          }, this.onStartOptions.onStartDelay! / 2);
        }, this.onStartOptions.onStartDelay! / 2);
      });
    }
  }

  changeURL(url: string) {
    this.setUrl(url);
  }
}

export class DelayMemoryKVStore extends MemoryKVStore {
  constructor(prefix: string, public readonly delay: number) {
    super(prefix);
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    return super.get(key);
  }

  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    return super.set(key, data);
  }
}

describe("Test observable query", () => {
  let serverProcessing = 0;

  const createTestServer = (delay: number = 100) => {
    let num = 0;

    const server = Http.createServer((req, resp) => {
      serverProcessing++;

      if (req.url === "/invalid") {
        serverProcessing--;
        throw new Error();
      }

      if (req.url === "/error1") {
        setTimeout(() => {
          resp.writeHead(503);
          resp.end();
          serverProcessing--;
        }, 1);
        return;
      }

      if (req.url === "/error2") {
        setTimeout(() => {
          resp.writeHead(400, {
            "content-type": "text/plain",
          });
          resp.end("message text");
          serverProcessing--;
        }, 1);
        return;
      }

      if (req.url === "/error3") {
        setTimeout(() => {
          resp.writeHead(400, {
            "content-type": "application/json; charset=utf-8",
          });
          resp.end(JSON.stringify({ message: "message text" }));
          serverProcessing--;
        }, 1);
        return;
      }

      let closed = false;
      req.once("close", () => {
        closed = true;
      });
      setTimeout(() => {
        if (!closed) {
          resp.writeHead(200);
          resp.end(num.toString());

          num++;
        }

        serverProcessing--;
      }, delay);
    });

    server.listen();

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to get address for server");
    }
    const port = address.port;

    return {
      port,
      closeServer: () => {
        server.close();
      },
      getNum: () => num,
    };
  };

  const notMockSetTimeout = setTimeout;
  const notMockSetInterval = setInterval;
  const notMockClearInterval = clearInterval;

  function waitServerAnyReqReceived() {
    return new Promise<void>((resolve) => {
      const id = notMockSetInterval(() => {
        if (serverProcessing > 0) {
          notMockClearInterval(id);
          resolve();
        }
      }, 10);
    });
  }
  function waitServerAllResSent() {
    return new Promise<void>((resolve) => {
      const id = notMockSetInterval(() => {
        if (serverProcessing === 0) {
          notMockClearInterval(id);
          resolve();
        }
      }, 10);
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    while (true) {
      // Clear remaining queries manually.
      if (serverProcessing === 0) {
        break;
      }
      jest.advanceTimersByTime(30);
      await new Promise((resolve) => notMockSetTimeout(resolve, 30));
    }

    jest.useRealTimers();
  });

  it("basic test", async () => {
    const basicTestFn = async (store: KVStore) => {
      const spyAbort = jest.spyOn(AbortController.prototype, "abort");

      const { port, closeServer } = createTestServer();

      const query = new MockObservableQuery(store, port);

      // Nothing is being fetched because no value has been observed
      expect(query.isObserved).toBe(false);
      expect(query.isFetching).toBe(false);
      expect(query.isStarted).toBe(false);
      expect(query.error).toBeUndefined();
      expect(query.response).toBeUndefined();

      const disposer = autorun(
        () => {
          // This makes the response observed. Thus, fetching starts.
          if (query.response) {
            expect(query.response.data).toBe(0);
          }
        },
        {
          onError: (e) => {
            throw e;
          },
        }
      );

      // Above code make query starts, but the response not yet fetched
      expect(query.isObserved).toBe(true);
      expect(query.isFetching).toBe(true);
      expect(query.isStarted).toBe(true);
      expect(query.error).toBeUndefined();
      expect(query.response).toBeUndefined();

      await waitServerAnyReqReceived();
      // Make sure that query complete
      jest.advanceTimersByTime(1000);
      await waitServerAllResSent();

      // Not yet observer disposed. So the query is still in observation.
      expect(query.isObserved).toBe(true);
      expect(query.isFetching).toBe(false);
      expect(query.isStarted).toBe(true);
      expect(query.error).toBeUndefined();
      expect(query.response).not.toBeUndefined();
      expect(query.response?.data).toBe(0);

      disposer();
      // Not, the observation ends
      expect(query.isObserved).toBe(false);
      expect(query.isFetching).toBe(false);
      expect(query.isStarted).toBe(false);
      expect(query.error).toBeUndefined();
      expect(query.response).not.toBeUndefined();
      expect(query.response?.data).toBe(0);

      await query.waitResponse();
      expect(query.response?.data).toBe(0);

      await new Promise((resolve) => {
        query.waitFreshResponse().then(resolve);
        waitServerAnyReqReceived().then(() => {
          // Make sure that query complete
          jest.advanceTimersByTime(1000);
        });
      });
      expect(query.response?.data).toBe(1);

      expect(spyAbort).toBeCalledTimes(0);

      spyAbort.mockRestore();

      // Advance timer much to release the promises for delay mem store.
      jest.advanceTimersByTime(100000);

      closeServer();
    };

    const memStore = new DelayMemoryKVStore("test", 1);
    await basicTestFn(memStore);

    // The kvstore below has a delay of 3 seconds.
    // This is definitely slower than the query.
    // Even if the kvstore performs worse than the query, it should handle it well.
    const delayMemStore = new DelayMemoryKVStore("test", 3000);
    await basicTestFn(delayMemStore);
  });

  it("test waitResponse() can ignore other component unobserved", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    const disposer = autorun(
      () => {
        if (query.response) {
          throw new Error("not canceled");
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    setTimeout(() => {
      disposer();
    }, 200);

    const [res] = await Promise.all([
      query.waitResponse(),
      (async () => {
        await waitServerAnyReqReceived();
        // Advance time about > 200ms to release observation.
        jest.advanceTimersByTime(300);

        // Wait real timer to make sure that the logic processed.
        await new Promise((resolve) => notMockSetTimeout(resolve, 100));

        // Complete query
        jest.advanceTimersByTime(300);
      })(),
    ]);
    expect(res?.data).toBe(0);

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test waitResponse() can ignore fetch requests", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data !== 0) {
          throw new Error("not canceled");
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    // Below line makes cancel and refresh
    setTimeout(() => {
      query.fetch();
    }, 10);

    const [res] = await Promise.all([
      query.waitResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        // Make explicit query
        jest.advanceTimersByTime(30);

        // Wait real timer to make sure that the logic processed.
        await new Promise((resolve) => notMockSetTimeout(resolve, 100));

        // Complete query
        jest.advanceTimersByTime(600);
      })(),
    ]);
    expect(res?.data).toBe(0);

    expect(spyAbort).toBeCalledTimes(1);

    spyAbort.mockRestore();

    disposer();

    closeServer();
  });

  it("test waitFreshResponse() can ignore other component unobserved", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    await Promise.all([
      query.waitFreshResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(600);
      })(),
    ]);

    const disposer = autorun(
      () => {
        if (query.response?.data !== 0) {
          throw new Error("not canceled");
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    setTimeout(() => {
      disposer();
    }, 200);

    const [res] = await Promise.all([
      query.waitFreshResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(300);

        // Wait real timer to make sure that the logic processed.
        await new Promise((resolve) => notMockSetTimeout(resolve, 100));

        jest.advanceTimersByTime(300);
      })(),
    ]);
    expect(res?.data).toBe(1);

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test waitFreshResponse() can ignore fetch requests", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    await Promise.all([
      query.waitFreshResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(600);
      })(),
    ]);

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response?.data !== 0 && query.response?.data !== 1) {
          throw new Error("not canceled");
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    // Below line makes cancel and refresh
    setTimeout(() => {
      query.fetch();
    }, 10);

    const [res] = await Promise.all([
      query.waitFreshResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(30);

        // Wait real timer to make sure that the logic processed.
        await new Promise((resolve) => notMockSetTimeout(resolve, 100));

        jest.advanceTimersByTime(600);
      })(),
    ]);
    expect(res?.data).toBe(1);

    expect(spyAbort).toBeCalledTimes(1);

    spyAbort.mockRestore();

    disposer();

    closeServer();
  });

  it("test waitFreshResponse()/waitFreshResponse()", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer();

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    let [res] = await Promise.all([
      query.waitResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(100);

        await waitServerAllResSent();
      })(),
    ]);
    expect(res?.data).toBe(0);

    [res] = await Promise.all([
      query.waitFreshResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(100);

        await waitServerAllResSent();
      })(),
    ]);
    expect(res?.data).toBe(1);

    [res] = await Promise.all([
      query.waitResponse(),
      (async () => {
        // At this time, no query should occur
        // await waitServerAnyReqReceived();

        jest.advanceTimersByTime(100);

        await waitServerAllResSent();
      })(),
    ]);
    expect(res?.data).toBe(1);

    [res] = await Promise.all([
      query.waitFreshResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(100);

        await waitServerAllResSent();
      })(),
    ]);
    expect(res?.data).toBe(2);

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test basic cancellation", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response) {
          throw new Error("not canceled");
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    // Dispose the observer before the fetch completes.
    await new Promise<void>((resolve) => {
      waitServerAnyReqReceived().then(() => {
        setTimeout(() => {
          disposer();
          resolve();
        }, 100);

        jest.advanceTimersByTime(100);
      });
    });

    // Wait real timer to make sure that the logic processed.
    await new Promise((resolve) => notMockSetTimeout(resolve, 100));

    // In this case, query should be canceled.
    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    // Cancellation should not make the error.
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    expect(spyAbort).toBeCalledTimes(1);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test restore from cache/query occurs at the same time if cache age not set", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new DelayMemoryKVStore("test", 300);
    await (async () => {
      // Make cache
      const query = new MockObservableQuery(memStore, port);
      await Promise.all([
        query.waitFreshResponse(),
        (async () => {
          await waitServerAnyReqReceived();

          jest.advanceTimersByTime(600);
        })(),
      ]);
    })();

    const query = new MockObservableQuery(memStore, port);

    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data >= 2) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await waitServerAnyReqReceived();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(100);

      // Wait real timer to make sure that the logic processed.
      notMockSetTimeout(resolve, 50);
    });

    // Not yet cache restored due to delayed kv store.
    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(210);

      // Wait real timer to make sure that the logic processed.
      notMockSetTimeout(resolve, 50);
    });

    // Now, the cache should be restored.
    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);
    expect(query.response?.staled).toBe(true);

    await new Promise((resolve) => {
      jest.advanceTimersByTime(200);

      // Wait real timer to make sure that the logic processed.
      notMockSetTimeout(resolve, 50);
    });

    // Now, total 510ms passed. If restoring from cache and querying occurs at the same time, query should be revalidated.
    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);
    expect(query.response?.staled).toBe(false);

    disposer();

    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);
    expect(query.response?.staled).toBe(false);

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test basic cache (valid)", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(200);

    const memStore = new MemoryKVStore("test");
    await (async () => {
      // Make cache
      const query = new MockObservableQuery(memStore, port);
      await Promise.all([
        query.waitFreshResponse(),
        (async () => {
          await waitServerAnyReqReceived();

          jest.advanceTimersByTime(200);
        })(),
      ]);
    })();

    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 300,
    });

    jest.advanceTimersByTime(150);

    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    let disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data >= 1) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    // Wait real timer to make sure that kv store's get method complete
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);
    expect(query.response?.staled).toBe(true);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    // Now, cache should be invalidated.
    jest.advanceTimersByTime(200);

    disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data >= 2) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);
    expect(query.response?.staled).toBe(true);

    await waitServerAnyReqReceived();
    jest.advanceTimersByTime(250);

    // Wait real timer to make sure that the logic processed.
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);
    expect(query.response?.staled).toBe(false);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test basic cache (invalidated)", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(200);

    const memStore = new MemoryKVStore("test");
    await (async () => {
      // Make cache
      const query = new MockObservableQuery(memStore, port);
      await Promise.all([
        query.waitFreshResponse(),
        (async () => {
          await waitServerAnyReqReceived();

          jest.advanceTimersByTime(200);
        })(),
      ]);
    })();

    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 300,
    });

    jest.advanceTimersByTime(350);

    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data != 1) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    // Wait real timer to make sure that kv store's get method complete
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));
    // Cache value abandoned

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await waitServerAnyReqReceived();
    jest.advanceTimersByTime(250);

    // Wait real timer to make sure that the logic processed.
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);
    expect(query.response?.staled).toBe(false);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test cache in age not make query", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 300,
    });

    const tests: {
      first?: boolean;
      postDelay: number;
      inCache: boolean;
      expect: number;
    }[] = [
      {
        first: true,
        postDelay: 100,
        inCache: false,
        expect: 0,
      },
      {
        postDelay: 100,
        inCache: true,
        expect: 0,
      },
      {
        postDelay: 100,
        inCache: true,
        expect: 0,
      },
      {
        postDelay: 100,
        inCache: false,
        expect: 1,
      },
      {
        postDelay: 200,
        inCache: true,
        expect: 1,
      },
      {
        postDelay: 300,
        inCache: false,
        expect: 2,
      },
      {
        postDelay: 300,
        inCache: false,
        expect: 3,
      },
    ];

    for (const test of tests) {
      const disposer = autorun(
        () => {
          // This makes the response observed. Thus, fetching starts.
          if (query.response && query.response.data >= 4) {
            throw new Error();
          }
        },
        {
          onError: (e) => {
            throw e;
          },
        }
      );

      expect(query.isObserved).toBe(true);
      if (!test.inCache) {
        expect(query.isFetching).toBe(true);
      } else {
        expect(query.isFetching).toBe(false);
      }
      expect(query.isStarted).toBe(true);

      // Wait real timer to make sure that kv store's get method complete
      await new Promise((resolve) => notMockSetTimeout(resolve, 50));

      const cached = query.response?.data;

      expect(query.isObserved).toBe(true);
      if (!test.inCache) {
        expect(query.isFetching).toBe(true);

        await waitServerAnyReqReceived();
      } else {
        expect(query.isFetching).toBe(false);
      }
      expect(query.isStarted).toBe(true);

      if (!test.first) {
        if (!test.inCache) {
          expect(query.response?.staled).toBe(true);
        } else {
          expect(query.response?.staled).toBe(false);
        }
      }

      jest.advanceTimersByTime(50);
      // Wait real timer to make sure that the logic processed.
      await new Promise((resolve) => notMockSetTimeout(resolve, 50));

      expect(query.isObserved).toBe(true);
      expect(query.isFetching).toBe(false);
      expect(query.isStarted).toBe(true);
      expect(query.response?.staled).toBe(false);

      expect(query.response?.data).toBe(test.expect);

      if (test.inCache) {
        expect(query.response?.data).toBe(cached);
      }

      disposer();

      jest.advanceTimersByTime(test.postDelay);
      // Wait real timer to make sure that the logic processed.
      await new Promise((resolve) => notMockSetTimeout(resolve, 50));
    }

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test cache in age not make query (via waitFreshResponse())", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 300,
    });

    const tests: {
      postDelay: number;
      inCache: boolean;
      expect: number;
    }[] = [
      {
        postDelay: 100,
        inCache: false,
        expect: 0,
      },
      {
        postDelay: 100,
        inCache: true,
        expect: 0,
      },
      {
        postDelay: 100,
        inCache: true,
        expect: 0,
      },
      {
        postDelay: 100,
        inCache: false,
        expect: 1,
      },
      {
        postDelay: 200,
        inCache: true,
        expect: 1,
      },
      {
        postDelay: 300,
        inCache: false,
        expect: 2,
      },
      {
        postDelay: 300,
        inCache: false,
        expect: 3,
      },
    ];

    for (const test of tests) {
      await Promise.all([
        query.waitFreshResponse(),
        (async () => {
          if (!test.inCache) {
            await waitServerAnyReqReceived();

            jest.advanceTimersByTime(50);
          }
        })(),
      ]);

      expect(query.response?.data).toBe(test.expect);

      jest.advanceTimersByTime(test.postDelay);
      // Wait real timer to make sure that the logic processed.
      await new Promise((resolve) => notMockSetTimeout(resolve, 50));
    }

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test cache in age not make query (via waitResponse())", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(1);

    const memStore = new MemoryKVStore("test");
    let query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });

    await Promise.all([
      query.waitResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(50);
      })(),
    ]);
    expect(query.response?.data).toBe(0);

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    expect(query.response).toBeUndefined();
    // Cache is still valid.
    await Promise.all([
      query.waitResponse(),
      (async () => {
        // Wait real timer to make sure that kv store's get method complete
        await new Promise((resolve) => notMockSetTimeout(resolve, 50));
      })(),
    ]);
    expect(query.response?.data).toBe(0);

    jest.advanceTimersByTime(50);

    // Cache is still valid.
    await Promise.all([
      query.waitResponse(),
      (async () => {
        // Wait real timer to make sure that kv store's get method complete
        await new Promise((resolve) => notMockSetTimeout(resolve, 50));
      })(),
    ]);
    expect(query.response?.data).toBe(0);

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    expect(query.response).toBeUndefined();
    jest.advanceTimersByTime(50);
    // Cache is now invalidated.
    await Promise.all([
      query.waitResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(50);

        // Wait real timer to make sure that the logic processed.
        await new Promise((resolve) => notMockSetTimeout(resolve, 50));
      })(),
    ]);
    expect(query.response?.data).toBe(1);

    jest.advanceTimersByTime(50);

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    // Cache is still valid.
    await Promise.all([
      query.waitResponse(),
      (async () => {
        // Wait real timer to make sure that kv store's get method complete
        await new Promise((resolve) => notMockSetTimeout(resolve, 50));
      })(),
    ]);
    expect(query.response?.data).toBe(1);

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    expect(query.response).toBeUndefined();
    jest.advanceTimersByTime(50);
    // Cache is now invalidated. (Prior cache should not change cache's timestamp)
    await Promise.all([
      query.waitResponse(),
      (async () => {
        await waitServerAnyReqReceived();

        jest.advanceTimersByTime(50);

        // Wait real timer to make sure that the logic processed.
        await new Promise((resolve) => notMockSetTimeout(resolve, 50));
      })(),
    ]);
    expect(query.response?.data).toBe(2);

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test basic auto refetching", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {
      fetchingInterval: 100,
    });

    await new Promise((resolve) => {
      jest.advanceTimersByTime(150);
      notMockSetTimeout(resolve, 150);
    });
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    let disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data >= 5) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    for (let i = 0; i < 4; i++) {
      // Make sure query complete
      await waitServerAnyReqReceived();
      jest.advanceTimersByTime(20);
      await new Promise((resolve) => notMockSetTimeout(resolve, 50));

      // Wait interval
      await new Promise((resolve) => {
        jest.advanceTimersByTime(100);
        notMockSetTimeout(resolve, 50);
      });
    }
    // Make sure query complete
    await waitServerAnyReqReceived();
    jest.advanceTimersByTime(20);
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));

    expect(query.response?.data).toBe(4);

    disposer();

    // After becoming unobserved, refetching should stop.
    await new Promise((resolve) => {
      jest.advanceTimersByTime(150);
      notMockSetTimeout(resolve, 150);
    });
    expect(query.response?.data).toBe(4);

    // Now, refetching should be restarted.
    disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (
          query.response &&
          (query.response.data < 4 || query.response.data >= 8)
        ) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    for (let i = 0; i < 2; i++) {
      // Make sure query complete
      await waitServerAnyReqReceived();
      jest.advanceTimersByTime(20);
      await new Promise((resolve) => notMockSetTimeout(resolve, 50));

      await new Promise((resolve) => {
        jest.advanceTimersByTime(100);
        notMockSetTimeout(resolve, 50);
      });
    }
    // Make sure query complete
    await waitServerAnyReqReceived();
    jest.advanceTimersByTime(20);
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));

    expect(query.response?.data).toBe(7);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test auto refetching with cache", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 150,
      fetchingInterval: 100,
    });

    await new Promise((resolve) => {
      jest.advanceTimersByTime(150);
      notMockSetTimeout(resolve, 150);
    });
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data >= 3) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    for (let i = 0; i < 4; i++) {
      if (i % 2 === 0) {
        // Make sure query complete
        await waitServerAnyReqReceived();
        jest.advanceTimersByTime(10);
        await new Promise((resolve) => notMockSetTimeout(resolve, 50));
      }

      await new Promise((resolve) => {
        jest.advanceTimersByTime(100);
        notMockSetTimeout(resolve, 50);
      });
    }
    // Make sure query complete
    await waitServerAnyReqReceived();
    jest.advanceTimersByTime(20);
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));

    expect(query.response?.data).toBe(2);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test set url before start not make query", async () => {
    // Setting url before `start` should not make a query.
    // This permits to determine the url conditionally before starting.

    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {}, "/invalid");

    await new Promise((resolve) => {
      jest.advanceTimersByTime(150);
      notMockSetTimeout(resolve, 150);
    });
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    query.changeURL("/test");

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data !== 0) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    // Make sure query complete
    await waitServerAnyReqReceived();
    jest.advanceTimersByTime(20);
    await new Promise((resolve) => notMockSetTimeout(resolve, 50));

    expect(query.response?.data).toBe(0);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test set url before query controller ready not make query", async () => {
    // Setting url before `DeferInitialQueryController` is ready should not make a query.
    // This permits to determine the url conditionally before query controller is ready.

    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer, getNum } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {}, "/invalid");

    const queryController = new DeferInitialQueryController();
    ObservableQueryBase.experimentalDeferInitialQueryController = queryController;

    await new Promise((resolve) => {
      jest.advanceTimersByTime(150);
      notMockSetTimeout(resolve, 150);
    });
    expect(query.isObserved).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.isFetching).toBe(false);
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data !== 0) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    query.changeURL("/test");
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });
    query.changeURL("/invalid");
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });
    query.changeURL("/test");
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(spyAbort).toBeCalledTimes(0);
    expect(getNum()).toBe(0);

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    queryController.ready();

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    expect(getNum()).toBe(1);

    ObservableQuery.experimentalDeferInitialQueryController = undefined;

    closeServer();
  });

  it("test set url before query controller ready not make query (with cache max age option)", async () => {
    // Setting url before `DeferInitialQueryController` is ready should not make a query.
    // This permits to determine the url conditionally before query controller is ready.

    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer, getNum } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(
      memStore,
      port,
      {
        cacheMaxAge: 100,
      },
      "/invalid"
    );

    const queryController = new DeferInitialQueryController();
    ObservableQueryBase.experimentalDeferInitialQueryController = queryController;

    await new Promise((resolve) => {
      jest.advanceTimersByTime(150);
      notMockSetTimeout(resolve, 150);
    });
    expect(query.isObserved).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.isFetching).toBe(false);
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data !== 0) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    query.changeURL("/test");
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });
    query.changeURL("/invalid");
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });
    query.changeURL("/test");
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(spyAbort).toBeCalledTimes(0);
    expect(getNum()).toBe(0);

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    queryController.ready();

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    expect(getNum()).toBe(1);

    ObservableQuery.experimentalDeferInitialQueryController = undefined;

    closeServer();
  });

  it("test set url on start not make query", async () => {
    // Setting url on `onStart()` method should not make a query.
    // This permits to determine the url conditionally on `onStart()`.

    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer, getNum } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockOnStartObservableQuery(
      memStore,
      port,
      {},
      "/invalid",
      {
        onStartUrl: "/test",
        onStartDelay: 100,
      }
    );

    expect(query.isObserved).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.isFetching).toBe(false);
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data !== 0) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    // Not yet onStart() finished due to delay.
    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    expect(spyAbort).toBeCalledTimes(0);
    expect(getNum()).toBe(0);

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(getNum()).toBe(1);

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    disposer();

    closeServer();
  });

  it("test set url on start not make query (cancellation before onStart() complete)", async () => {
    // Setting url on `onStart()` method should not make a query.
    // This permits to determine the url conditionally on `onStart()`.

    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer, getNum } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockOnStartObservableQuery(
      memStore,
      port,
      {},
      "/invalid",
      {
        onStartUrl: "/test",
        onStartDelay: 200,
      }
    );

    expect(query.isObserved).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.isFetching).toBe(false);
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    let disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data !== 0) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    // Dispose the observer before the start delay passed.
    disposer();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    expect(spyAbort).toBeCalledTimes(0);
    expect(getNum()).toBe(0);

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data !== 0) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(200);
      notMockSetTimeout(resolve, 50);
    });
    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    expect(getNum()).toBe(1);
    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    disposer();

    closeServer();
  });

  it("test cancel not make query before onStart() complete", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer, getNum } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockOnStartObservableQuery(memStore, port, {}, "/test", {
      onStartDelay: 200,
    });

    expect(query.isObserved).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.isFetching).toBe(false);
    // Should not fetch until starting observed.
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(10);
      notMockSetTimeout(resolve, 10);
    });

    // Not yet onStart() finished due to delay.
    expect(query.isObserved).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    expect(spyAbort).toBeCalledTimes(0);
    expect(getNum()).toBe(0);

    disposer();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    expect(getNum()).toBe(0);
    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test synchronous setUrl not make multiple queries", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer, getNum } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data >= 2) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    query.changeURL("/invalid");
    query.changeURL("/error1");
    query.changeURL("/error2");
    query.changeURL("/error3");
    query.changeURL("/test");

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);

    disposer();

    expect(getNum()).toBe(2);
    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test synchronous setUrl not make multiple queries when onStart is async", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer, getNum } = createTestServer(50);

    const memStore = new MemoryKVStore("test");
    const query = new MockOnStartObservableQuery(memStore, port, {}, "/test", {
      onStartDelay: 50,
      onStartUrl: "/test",
    });

    query.changeURL("/invalid");

    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response && query.response.data >= 2) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    query.changeURL("/error1");
    query.changeURL("/error2");

    await new Promise((resolve) => {
      jest.advanceTimersByTime(20);
      notMockSetTimeout(resolve, 20);
    });

    query.changeURL("/error2");
    query.changeURL("/error3");
    query.changeURL("/test");

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    query.changeURL("/invalid");
    query.changeURL("/error1");
    query.changeURL("/error2");
    query.changeURL("/error3");
    query.changeURL("/test");

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);

    disposer();

    expect(getNum()).toBe(2);
    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });

  it("test error message", async () => {
    const spyAbort = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(1);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {}, "/error1");

    const disposer = autorun(
      () => {
        // This makes the response observed. Thus, fetching starts.
        if (query.response) {
          throw new Error();
        }
      },
      {
        onError: (e) => {
          throw e;
        },
      }
    );

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isObserved).toBe(true);
    expect(query.response).toBeUndefined();
    expect(query.error?.status).toBe(503);
    expect(query.error?.statusText).toBe("Service Unavailable");
    expect(query.error?.message).toBe("Service Unavailable");
    expect(query.error?.data).toBe("");

    query.changeURL("/error2");

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isObserved).toBe(true);
    expect(query.response).toBeUndefined();
    expect(query.error?.status).toBe(400);
    expect(query.error?.statusText).toBe("Bad Request");
    expect(query.error?.message).toBe("message text");
    expect(query.error?.data).toBe("message text");

    query.changeURL("/error3");

    await waitServerAnyReqReceived();
    // Make sure query complete
    await new Promise((resolve) => {
      jest.advanceTimersByTime(50);
      notMockSetTimeout(resolve, 50);
    });

    expect(query.isStarted).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isObserved).toBe(true);
    expect(query.response).toBeUndefined();
    expect(query.error?.status).toBe(400);
    expect(query.error?.statusText).toBe("Bad Request");
    expect(query.error?.message).toBe("message text");
    expect(query.error?.data).toStrictEqual({ message: "message text" });

    disposer();

    expect(spyAbort).toBeCalledTimes(0);

    spyAbort.mockRestore();

    closeServer();
  });
});
