import { SettledResponse, SettledResponses } from "@keplr-wallet/types";
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
      this.nextTick(this.tick);
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

    this.nextTick(this.tick);
  }

  protected nextTick(fn: () => void): void {
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(fn);
    } else {
      setTimeout(fn, 10);
    }
  }
}
