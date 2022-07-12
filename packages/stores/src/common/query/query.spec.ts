import { ObservableQuery } from "./index";
import { KVStore, MemoryKVStore } from "@keplr-wallet/common";
import Axios from "axios";
import Http from "http";
import { autorun } from "mobx";

export class MockObservableQuery extends ObservableQuery<number> {
  constructor(kvStore: KVStore) {
    const instance = Axios.create({
      baseURL: "http://127.0.0.1:9234",
    });

    super(kvStore, instance, "/test");
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
  let server: Http.Server | undefined;
  let num = 0;

  beforeEach(() => {
    num = 0;

    server = Http.createServer((_, resp) => {
      setTimeout(() => {
        resp.writeHead(200);
        resp.end(num.toString());

        num++;
      }, 200);
    });

    server.listen(9234);
  });

  afterEach(() => {
    if (server) {
      server.close();
      server = undefined;
    }
  });

  it("basic test", async () => {
    const basicTestFn = async (store: KVStore) => {
      const query = new MockObservableQuery(store);

      // Nothing is being fetched because no value has been observed
      expect(query.isObserved).toBe(false);
      expect(query.isFetching).toBe(false);
      expect(query.error).toBeUndefined();
      expect(query.response).toBeUndefined();

      const disposer = autorun(
        () => {
          // This makes the response observed. Thus, fetching starts.
          if (query.response) {
            expect(query.response.data).toBe(0);

            disposer();
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
      expect(query.error).toBeUndefined();
      expect(query.response).toBeUndefined();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(query.isObserved).toBe(false);
      expect(query.isFetching).toBe(false);
      expect(query.error).toBeUndefined();
      expect(query.response).not.toBeUndefined();
      expect(query.response?.data).toBe(0);

      await query.waitResponse();
      expect(query.response?.data).toBe(0);

      await query.waitFreshResponse();
      expect(query.response?.data).toBe(1);
    };

    const memStore = new DelayMemoryKVStore("test", 1);
    await basicTestFn(memStore);

    num = 0;
    // The kvstore below has a delay of 50 seconds.
    // This is definitely slower than the query.
    // Even if the kvstore performs worse than the query, it should handle it well.
    const delayMemStore = new DelayMemoryKVStore("test", 50000);
    await basicTestFn(delayMemStore);
  });
});
