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

describe("Test observable query", () => {
  let server: Http.Server | undefined;

  beforeEach(() => {
    let num = 0;
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
    const memStore = new MemoryKVStore("test");

    const query = new MockObservableQuery(memStore);

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
  });
});
