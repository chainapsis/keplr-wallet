import {
  Keplr,
  Key,
  SettledResponse,
  SettledResponses,
} from "@keplr-wallet/types";
import { runInAction } from "mobx";

export class DebounceActionTimer<ARGS, R> {
  protected requests: {
    args: ARGS;
    action: (res: SettledResponse<R>) => void;
    resolver: () => void;
  }[] = [];

  protected startTime: number = 0;

  constructor(
    public readonly debounceMs: number,
    public readonly handler: (
      requests: {
        args: ARGS;
        action: (res: SettledResponse<R>) => void;
      }[]
    ) => Promise<SettledResponses<R>> | SettledResponses<R>
  ) {}

  protected tick: () => void = () => {
    let shouldExec = this.debounceMs <= 0;
    if (this.debounceMs > 0) {
      const now = Date.now();
      if (now - this.startTime >= this.debounceMs) {
        shouldExec = true;
      }
    }

    if (shouldExec) {
      const requests = this.requests.slice();

      // Should use sliced array
      Promise.resolve(this.handler(requests)).then((responses) => {
        runInAction(() => {
          for (let i = 0; i < requests.length; i++) {
            const req = requests[i];
            const res = responses[i];

            req.action(res);
          }
        });

        for (const req of requests) {
          req.resolver();
        }
      });

      this.requests = [];
    } else {
      this.setImmediate(this.tick);
    }
  };

  call(args: ARGS, action: (res: SettledResponse<R>) => void): Promise<void> {
    return new Promise((resolve) => {
      const newStart = this.requests.length === 0;

      this.requests.push({ args, action, resolver: resolve });

      if (newStart) {
        this.startTimer();
      }
    });
  }

  protected startTimer(): void {
    this.startTime = Date.now();

    this.setImmediate(this.tick);
  }

  protected setImmediate(fn: () => void): void {
    window.requestAnimationFrame(fn);
  }
}

export class AccountSharedContext {
  protected getKeyDecounceTimer = new DebounceActionTimer<
    [keplr: Keplr, chainId: string],
    Key
  >(0, async (requests) => {
    const map = new Map<Keplr, Set<string>>();
    const resMap = new Map<Keplr, Map<string, SettledResponse<Key>>>();

    for (const req of requests) {
      if (!map.has(req.args[0])) {
        map.set(req.args[0], new Set());
      }

      if (!resMap.has(req.args[0])) {
        resMap.set(req.args[0], new Map());
      }

      map.get(req.args[0])!.add(req.args[1]);
    }

    for (const [keplr, chainIdSet] of map) {
      const chainIds = Array.from(chainIdSet);
      const settled = await keplr.getKeysSettled(chainIds);

      const settledMap = resMap.get(keplr)!;
      for (let i = 0; i < chainIds.length; i++) {
        const chainId = chainIds[i];
        const res = settled[i];
        settledMap.set(chainId, res);
      }

      resMap.set(keplr, settledMap);
    }

    return requests.map((req) => resMap.get(req.args[0])!.get(req.args[1])!);
  });

  getKey(
    keplr: Keplr,
    chainId: string,
    action: (res: SettledResponse<Key>) => void
  ): Promise<void> {
    return this.getKeyDecounceTimer.call([keplr, chainId], action);
  }
}
