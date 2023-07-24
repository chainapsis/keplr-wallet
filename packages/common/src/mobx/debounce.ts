import { SettledResponse, SettledResponses } from "@keplr-wallet/types";
import { runInAction } from "mobx";

type Request<ARGS, R> = {
  args: ARGS;
  action: (res: SettledResponse<R>) => void;
  resolver: () => void;
};

export class DebounceActionTimer<ARGS, R> {
  protected requests: Request<ARGS, R>[] = [];

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
      // Should use sliced (copied) array
      const requests = this.requests.slice();
      const responses = this.handler(requests);
      if (typeof responses === "object" && "then" in responses) {
        Promise.resolve(responses).then((responses) => {
          this.handleResponses(requests, responses);
        });
      } else {
        this.handleResponses(requests, responses);
      }

      this.requests = [];
    } else {
      this.nextTick(this.tick);
    }
  };

  protected handleResponses: (
    requests: Request<ARGS, R>[],
    responses: SettledResponses<R>
  ) => void = (requests, responses) => {
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
    if (this.debounceMs <= 0) {
      Promise.resolve().then(fn);
      return;
    }

    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(fn);
    } else {
      setTimeout(fn, this.debounceMs);
    }
  }
}
