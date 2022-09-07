import { ObservableQuery, QueryOptions } from "./index";
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
  const createTestServer = (delay: number = 100) => {
    let num = 0;

    const server = Http.createServer((req, resp) => {
      if (req.url === "/invalid") {
        throw new Error();
      }

      if (req.url === "/error1") {
        resp.writeHead(503);
        resp.end();
        return;
      }

      if (req.url === "/error2") {
        resp.writeHead(400, {
          "content-type": "text/plain",
        });
        resp.end("message text");
        return;
      }

      if (req.url === "/error3") {
        resp.writeHead(400, {
          "content-type": "application/json; charset=utf-8",
        });
        resp.end(JSON.stringify({ message: "message text" }));
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

  it("basic test", async () => {
    const basicTestFn = async (store: KVStore) => {
      const abortSpy = jest.spyOn(AbortController.prototype, "abort");

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

      // Make sure that the fetching complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      await query.waitFreshResponse();
      expect(query.response?.data).toBe(1);

      expect(abortSpy).toBeCalledTimes(0);

      abortSpy.mockRestore();

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
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

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

    const res = await query.waitResponse();
    expect(res?.data).toBe(0);

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test waitResponse() can ignore fetch requests", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

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

    const res = await query.waitResponse();
    expect(res?.data).toBe(0);

    expect(abortSpy).toBeCalledTimes(1);

    abortSpy.mockRestore();

    disposer();

    closeServer();
  });

  it("test waitFreshResponse() can ignore other component unobserved", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    await query.waitFreshResponse();

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

    const res = await query.waitFreshResponse();
    expect(res?.data).toBe(1);

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test waitFreshResponse() can ignore fetch requests", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    await query.waitFreshResponse();

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

    const res = await query.waitFreshResponse();
    expect(res?.data).toBe(1);

    expect(abortSpy).toBeCalledTimes(1);

    abortSpy.mockRestore();

    disposer();

    closeServer();
  });

  it("test waitFreshResponse()/waitFreshResponse()", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer();

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port);

    let res = await query.waitResponse();
    expect(res?.data).toBe(0);

    res = await query.waitFreshResponse();
    expect(res?.data).toBe(1);

    res = await query.waitResponse();
    expect(res?.data).toBe(1);

    res = await query.waitFreshResponse();
    expect(res?.data).toBe(2);

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test basic cancellation", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

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
      setTimeout(() => {
        disposer();
        resolve();
      }, 100);
    });

    // Wait to close request.
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    // In this case, query should be canceled.
    expect(query.isObserved).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(false);
    // Cancellation should not make the error.
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    expect(abortSpy).toBeCalledTimes(1);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test restore from cache/query occurs at the same time if cache age not set", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(500);

    const memStore = new DelayMemoryKVStore("test", 300);
    await (async () => {
      // Make cache
      const query = new MockObservableQuery(memStore, port);
      await query.waitFreshResponse();
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

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Not yet cache restored due to delayed kv store.
    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      setTimeout(resolve, 210);
    });

    // Now, the cache should be restored.
    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);
    expect(query.response?.staled).toBe(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
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

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test basic cache (valid)", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(200);

    const memStore = new MemoryKVStore("test");
    await (async () => {
      // Make cache
      const query = new MockObservableQuery(memStore, port);
      await query.waitFreshResponse();
    })();

    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 300,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 150);
    });

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

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);
    expect(query.response?.staled).toBe(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(0);
    expect(query.response?.staled).toBe(true);

    disposer();

    expect(abortSpy).toBeCalledTimes(0);

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

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);
    expect(query.response?.staled).toBe(false);

    disposer();

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test basic cache (invalidated)", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(200);

    const memStore = new MemoryKVStore("test");
    await (async () => {
      // Make cache
      const query = new MockObservableQuery(memStore, port);
      await query.waitFreshResponse();
    })();

    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 300,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

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

    await new Promise((resolve) => {
      setTimeout(resolve, 30);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response).toBeUndefined();

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });

    expect(query.isObserved).toBe(true);
    expect(query.isFetching).toBe(false);
    expect(query.isStarted).toBe(true);
    expect(query.error).toBeUndefined();
    expect(query.response?.data).toBe(1);
    expect(query.response?.staled).toBe(false);

    disposer();

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test cache in age not make query", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

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

      await new Promise((resolve) => {
        setTimeout(resolve, 1);
      });

      const cached = query.response?.data;

      expect(query.isObserved).toBe(true);
      if (!test.inCache) {
        expect(query.isFetching).toBe(true);
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

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });

      expect(query.isObserved).toBe(true);
      expect(query.isFetching).toBe(false);
      expect(query.isStarted).toBe(true);
      expect(query.response?.staled).toBe(false);

      expect(query.response?.data).toBe(test.expect);

      if (test.inCache) {
        expect(query.response?.data).toBe(cached);
      }

      disposer();

      await new Promise((resolve) => {
        setTimeout(resolve, test.postDelay);
      });
    }

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test cache in age not make query (via waitFreshResponse())", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 300,
    });

    const tests: {
      postDelay: number;
      expect: number;
    }[] = [
      {
        postDelay: 100,
        expect: 0,
      },
      {
        postDelay: 100,
        expect: 0,
      },
      {
        postDelay: 100,
        expect: 0,
      },
      {
        postDelay: 100,
        expect: 1,
      },
      {
        postDelay: 200,
        expect: 1,
      },
      {
        postDelay: 300,
        expect: 2,
      },
      {
        postDelay: 300,
        expect: 3,
      },
    ];

    for (const test of tests) {
      await query.waitFreshResponse();

      expect(query.response?.data).toBe(test.expect);

      await new Promise((resolve) => {
        setTimeout(resolve, test.postDelay);
      });
    }

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test cache in age not make query (via waitResponse())", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(1);

    const memStore = new MemoryKVStore("test");
    let query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });

    await query.waitResponse();
    expect(query.response?.data).toBe(0);

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    expect(query.response).toBeUndefined();
    // Cache is still valid.
    await query.waitResponse();
    expect(query.response?.data).toBe(0);

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    // Cache is still valid.
    await query.waitResponse();
    expect(query.response?.data).toBe(0);

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    expect(query.response).toBeUndefined();
    await new Promise((resolve) => {
      setTimeout(resolve, 55);
    });
    // Cache is now invalidated.
    await query.waitResponse();
    expect(query.response?.data).toBe(1);

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    // Cache is still valid.
    await query.waitResponse();
    expect(query.response?.data).toBe(1);

    // Create new query
    query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 100,
    });
    expect(query.response).toBeUndefined();
    await new Promise((resolve) => {
      setTimeout(resolve, 55);
    });
    // Cache is now invalidated. (Prior cache should not change cache's timestamp)
    await query.waitResponse();
    expect(query.response?.data).toBe(2);

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test basic auto refetching", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {
      fetchingInterval: 100,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 150);
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

    await new Promise((resolve) => {
      setTimeout(resolve, 450);
    });

    expect(query.response?.data).toBe(4);

    disposer();

    // After becoming unobserved, refetching should stop.
    await new Promise((resolve) => {
      setTimeout(resolve, 150);
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

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });

    expect(query.response?.data).toBe(7);

    disposer();

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });

  it("test auto refetching with cache", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { port, closeServer } = createTestServer(10);

    const memStore = new MemoryKVStore("test");
    const query = new MockObservableQuery(memStore, port, {
      cacheMaxAge: 150,
      fetchingInterval: 100,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 150);
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

    await new Promise((resolve) => {
      setTimeout(resolve, 450);
    });

    expect(query.response?.data).toBe(2);

    disposer();

    expect(abortSpy).toBeCalledTimes(0);

    abortSpy.mockRestore();

    closeServer();
  });
});
