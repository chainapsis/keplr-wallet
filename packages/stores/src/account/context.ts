import {
  Keplr,
  Key,
  SettledResponse,
  SettledResponses,
} from "@keplr-wallet/types";
import { DebounceActionTimer } from "@keplr-wallet/common";

export class AccountSharedContext {
  protected suggestChainDebounceTimer = new DebounceActionTimer<
    [fn: () => Promise<void>],
    void
  >(0, async (requests) => {
    const responses: SettledResponses<void> = [];
    for (const req of requests) {
      try {
        await req.args[0]();
        responses.push({
          status: "fulfilled",
          value: undefined,
        });
      } catch (e) {
        responses.push({
          status: "rejected",
          reason: e,
        });
      }
    }

    return responses;
  });
  protected enableDebounceTimer = new DebounceActionTimer<
    [chainId: string],
    void
  >(0, async (requests) => {
    const keplr = await this.getKeplr();

    if (!keplr) {
      return requests.map(() => {
        return {
          status: "rejected",
          reason: new Error("Keplr is not installed"),
        };
      });
    }

    const chainIdSet = new Set<string>(requests.map((req) => req.args[0]));
    const chainIds = Array.from(chainIdSet);
    try {
      await keplr.enable(chainIds);

      return requests.map(() => {
        return {
          status: "fulfilled",
          value: undefined,
        };
      });
    } catch (e) {
      return requests.map(() => {
        return {
          status: "rejected",
          reason: e,
        };
      });
    }
  });
  protected getKeyDebounceTimer = new DebounceActionTimer<
    [chainId: string],
    Key
  >(0, async (requests) => {
    const keplr = await this.getKeplr();

    if (!keplr) {
      return requests.map(() => {
        return {
          status: "rejected",
          reason: new Error("Keplr is not installed"),
        };
      });
    }

    const chainIdSet = new Set<string>(requests.map((req) => req.args[0]));
    const chainIds = Array.from(chainIdSet);

    const settled = await keplr.getKeysSettled(chainIds);

    const settledMap = new Map<string, SettledResponse<Key>>();
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const res = settled[i];
      settledMap.set(chainId, res);
    }

    return requests.map((req) => settledMap.get(req.args[0])!);
  });

  protected promiseGetKeplr?: Promise<Keplr | undefined>;

  constructor(protected readonly _getKeplr: () => Promise<Keplr | undefined>) {}

  async getKeplr(): Promise<Keplr | undefined> {
    if (this.promiseGetKeplr) {
      return this.promiseGetKeplr;
    }

    const promise = new Promise<Keplr | undefined>((resolve, reject) => {
      this._getKeplr()
        .then((keplr) => {
          this.promiseGetKeplr = undefined;
          resolve(keplr);
        })
        .catch((e) => {
          this.promiseGetKeplr = undefined;
          reject(e);
        });
    });
    return (this.promiseGetKeplr = promise);
  }

  suggestChain(fn: () => Promise<void>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.suggestChainDebounceTimer.call([fn], (res) => {
        if (res.status === "fulfilled") {
          resolve();
        } else {
          reject(res.reason);
        }
      });
    });
  }

  enable(chainId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.enableDebounceTimer.call([chainId], (res) => {
        if (res.status === "fulfilled") {
          resolve();
        } else {
          reject(res.reason);
        }
      });
    });
  }

  getKey(
    chainId: string,
    action: (res: SettledResponse<Key>) => void
  ): Promise<void> {
    return this.getKeyDebounceTimer.call([chainId], action);
  }
}
