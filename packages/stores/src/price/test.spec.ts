import { CoinGeckoPriceStore } from "./index";
import { MemoryKVStore } from "@keplr-wallet/common";
import { autorun } from "mobx";
import Http from "http";

describe("Test coin gecko price store", () => {
  const createMockCoingeckoServer = (delay: number = 50) => {
    const testPrices: Record<string, Record<string, number> | undefined> = {
      "e-money-eur": { usd: 0.94995, krw: 1287.2 },
      "crypto-com-chain": { usd: 0.119683, krw: 162.14 },
      "usd-coin": { usd: 1.0, krw: 1355.18 },
      sifchain: { usd: 0.00366274, krw: 4.96 },
      "juno-network": { usd: 5.17, krw: 6998.65 },
      "iris-network": { usd: 0.01940888, krw: 26.29 },
      weth: { usd: 1558.4, krw: 2111213 },
      "e-money": { usd: 0.262887, krw: 356.22 },
      cosmos: { usd: 11.96, krw: 16198.65 },
      secret: { usd: 1.09, krw: 1477.1 },
      persistence: { usd: 0.659907, krw: 893.99 },
      sommelier: { usd: 0.266412, krw: 360.99 },
      "akash-network": { usd: 0.329846, krw: 446.85 },
      ion: { usd: 1095.99, krw: 1485088 },
      regen: { usd: 0.313163, krw: 424.34 },
      stargaze: { usd: 0.03064561, krw: 41.53 },
      osmosis: { usd: 1.19, krw: 1609.45 },
      sentinel: { usd: 0.00075533, krw: 1.023 },
      starname: { usd: 0.00882818, krw: 11.96 },
    };

    let count = 0;

    const server = Http.createServer((req, resp) => {
      if (!req.url) {
        throw new Error("Unknown endpoint");
      }

      const i = req.url.indexOf("?");
      const uri = req.url.slice(0, i);
      if (uri !== "/simple/price") {
        throw new Error("Unknown endpoint");
      }
      const queryString = req.url.slice(i + 1);
      const query = (() => {
        const result: Record<string, string> = {};
        const frags = queryString.split("&");
        for (const frag of frags) {
          const kv = frag.split("=");
          result[kv[0]] = kv[1];
        }

        return result;
      })();

      let closed = false;
      req.once("close", () => {
        closed = true;
      });
      setTimeout(() => {
        if (!closed) {
          resp.writeHead(200, {
            "content-type": "application/json; charset=utf-8",
          });
          const res: any = {};
          const vsCurrencies = query["vs_currencies"].split(",");
          const ids = query["ids"].split(",");
          for (const id of ids) {
            const prices: any = {};
            for (const vsCurrency of vsCurrencies) {
              const p = testPrices[id];
              if (p && p[vsCurrency]) {
                prices[vsCurrency] = p[vsCurrency];
              }
            }
            res[id] = prices;
          }

          resp.end(JSON.stringify(res));

          count++;
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
      getServerRespCount: () => count,
      getTestPrice: (id: string, vsCurrency: string) => {
        const p = testPrices[id];
        if (p && p[vsCurrency]) {
          return p[vsCurrency];
        }
        return;
      },
      getTestPrices: () => testPrices,
    };
  };

  it("test basic query", async () => {
    const { port, closeServer, getTestPrice } = createMockCoingeckoServer();

    const priceStore = new CoinGeckoPriceStore(
      new MemoryKVStore("test"),
      {
        usd: {
          currency: "usd",
          symbol: "$",
          maxDecimals: 2,
          locale: "en-US",
        },
      },
      "usd",
      {
        baseURL: `http://localhost:${port}`,
        throttleDuration: 10,
      }
    );

    let disposer = autorun(() => {
      const price = priceStore.getPrice("cosmos");
      if (price != null && price !== getTestPrice("cosmos", "usd")) {
        throw new Error();
      }
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(priceStore.getPrice("cosmos")).toBe(getTestPrice("cosmos", "usd"));

    disposer();

    disposer = autorun(() => {
      const price = priceStore.getPrice("osmosis");
      if (price != null && price !== getTestPrice("osmosis", "usd")) {
        throw new Error();
      }
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(priceStore.getPrice("cosmos")).toBe(getTestPrice("cosmos", "usd"));
    expect(priceStore.getPrice("osmosis")).toBe(getTestPrice("osmosis", "usd"));

    disposer();

    closeServer();
  });

  it("test that price store remembers last used coin ids", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const store = new MemoryKVStore("test");

    // Query cosmos,osmosis,regen price
    await (async () => {
      const {
        port,
        closeServer,
        getTestPrice,
        getServerRespCount,
      } = createMockCoingeckoServer();

      const priceStore = new CoinGeckoPriceStore(
        store,
        {
          usd: {
            currency: "usd",
            symbol: "$",
            maxDecimals: 2,
            locale: "en-US",
          },
        },
        "usd",
        {
          baseURL: `http://localhost:${port}`,
          throttleDuration: 10,
        }
      );

      const disposer = autorun(() => {
        let price = priceStore.getPrice("cosmos");
        if (price != null && price !== getTestPrice("cosmos", "usd")) {
          throw new Error();
        }
        price = priceStore.getPrice("osmosis");
        if (price != null && price !== getTestPrice("osmosis", "usd")) {
          throw new Error();
        }
        price = priceStore.getPrice("regen");
        if (price != null && price !== getTestPrice("regen", "usd")) {
          throw new Error();
        }
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(priceStore.getPrice("cosmos")).toBe(getTestPrice("cosmos", "usd"));
      expect(priceStore.getPrice("osmosis")).toBe(
        getTestPrice("osmosis", "usd")
      );

      expect(getServerRespCount()).toBe(1);
      expect(abortSpy).toBeCalledTimes(0);

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      disposer();

      closeServer();
    })();

    await (async () => {
      const {
        port,
        closeServer,
        getTestPrice,
        getServerRespCount,
      } = createMockCoingeckoServer();

      const priceStore = new CoinGeckoPriceStore(
        store,
        {
          usd: {
            currency: "usd",
            symbol: "$",
            maxDecimals: 2,
            locale: "en-US",
          },
        },
        "usd",
        {
          baseURL: `http://localhost:${port}`,
          throttleDuration: 10,
        }
      );

      const disposer = autorun(() => {
        // Try to fetch only cosmos price.
        const price = priceStore.getPrice("cosmos");
        if (price != null && price !== getTestPrice("cosmos", "usd")) {
          throw new Error();
        }
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(priceStore.getPrice("cosmos")).toBe(getTestPrice("cosmos", "usd"));

      disposer();

      // Above, tried to fetch only cosmos price. But, price store should remember the last used coin ids, so the cosmos,osmosis,regen should be fetched initially.
      expect(priceStore.getPrice("cosmos")).toBe(getTestPrice("cosmos", "usd"));
      expect(priceStore.getPrice("osmosis")).toBe(
        getTestPrice("osmosis", "usd")
      );
      // In this time, do not use "regen" to check that the price store only remembers the actual used coin ids.
      // expect(priceStore.getPrice("regen")).toBe(getTestPrice("regen", "usd"));

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(getServerRespCount()).toBe(1);
      expect(abortSpy).toBeCalledTimes(0);

      disposer();

      closeServer();
    })();

    await (async () => {
      const {
        port,
        closeServer,
        getTestPrice,
        getServerRespCount,
      } = createMockCoingeckoServer();

      const priceStore = new CoinGeckoPriceStore(
        store,
        {
          usd: {
            currency: "usd",
            symbol: "$",
            maxDecimals: 2,
            locale: "en-US",
          },
        },
        "usd",
        {
          baseURL: `http://localhost:${port}`,
          throttleDuration: 10,
        }
      );

      const disposer = autorun(() => {
        // Try to fetch only cosmos price.
        const price = priceStore.getPrice("cosmos");
        if (price != null && price !== getTestPrice("cosmos", "usd")) {
          throw new Error();
        }
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(priceStore.getPrice("cosmos")).toBe(getTestPrice("cosmos", "usd"));

      disposer();

      // Above, tried to fetch only cosmos price. But, price store should remember the last used coin ids, so the cosmos,osmosis should be fetched initially.
      expect(priceStore.getPrice("cosmos")).toBe(getTestPrice("cosmos", "usd"));
      expect(priceStore.getPrice("osmosis")).toBe(
        getTestPrice("osmosis", "usd")
      );
      expect(priceStore.getPrice("regen")).toBeUndefined();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(getServerRespCount()).toBe(1);
      expect(abortSpy).toBeCalledTimes(0);

      disposer();

      closeServer();
    })();

    abortSpy.mockRestore();
  });

  it("test that price store not make multiple queries in sync loop (with no throttling)", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const {
      port,
      closeServer,
      getTestPrice,
      getTestPrices,
      getServerRespCount,
    } = createMockCoingeckoServer();

    const priceStore = new CoinGeckoPriceStore(
      new MemoryKVStore("test"),
      {
        usd: {
          currency: "usd",
          symbol: "$",
          maxDecimals: 2,
          locale: "en-US",
        },
      },
      "usd",
      {
        baseURL: `http://localhost:${port}`,
        throttleDuration: 0,
      }
    );

    const disposer = autorun(() => {
      const tests = getTestPrices();
      let i = 0;
      for (const coinId of Object.keys(tests)) {
        if (i > 3) {
          break;
        }

        priceStore.getPrice(coinId);

        i++;
      }
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    const disposer2 = autorun(() => {
      const tests = getTestPrices();
      for (const coinId of Object.keys(tests)) {
        priceStore.getPrice(coinId);
      }
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    const tests = getTestPrices();
    for (const coinId of Object.keys(tests)) {
      expect(priceStore.getPrice(coinId)).toBe(getTestPrice(coinId, "usd"));
    }

    disposer();
    disposer2();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(getServerRespCount()).toBe(2);
    expect(abortSpy).toBeCalledTimes(0);

    disposer();

    abortSpy.mockRestore();

    closeServer();
  });
});
