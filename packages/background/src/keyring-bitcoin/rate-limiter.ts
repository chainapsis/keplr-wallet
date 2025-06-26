export interface RateLimiterOptions {
  interval: number;
  maxRequests: number;
  timeout?: number;
}

export interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  addedAt: number;
}

export const DEFAULT_RATE_LIMIT_TIMEOUT = 30000;

export class RateLimiter {
  private queue: QueuedRequest<any>[] = [];
  private processing = false;
  private requestHistory: number[] = [];
  private readonly options: Required<RateLimiterOptions>;

  constructor(options: RateLimiterOptions) {
    this.options = {
      timeout: DEFAULT_RATE_LIMIT_TIMEOUT,
      ...options,
    };
  }

  async add<T>(
    fn: () => Promise<T>,
    options?: { timeout?: number }
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = options?.timeout ?? this.options.timeout;
      const addedAt = Date.now();

      // set timeout
      const timeoutId = setTimeout(() => {
        // remove from queue
        const index = this.queue.findIndex((req) => req.addedAt === addedAt);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        reject(new Error("Request timeout"));
      }, timeout);

      const queuedRequest: QueuedRequest<T> = {
        fn,
        resolve: (value: T) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        reject: (error: Error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        addedAt,
      };

      this.queue.push(queuedRequest);

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // check rate limit
      await this.waitIfNeeded();

      const request = this.queue.shift();
      if (!request) break;

      try {
        // record request before execution
        this.requestHistory.push(Date.now());

        const result = await request.fn();
        request.resolve(result);
      } catch (error) {
        request.reject(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    this.processing = false;
  }

  private async waitIfNeeded(): Promise<void> {
    const now = Date.now();

    // remove expired request history
    this.requestHistory = this.requestHistory.filter(
      (timestamp) => now - timestamp < this.options.interval
    );

    // check rate limit
    if (this.requestHistory.length >= this.options.maxRequests) {
      const oldestRequest = this.requestHistory[0];
      const waitTime = this.options.interval - (now - oldestRequest);

      if (waitTime > 0) {
        await this.delay(waitTime);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getPendingRequests(): number {
    return this.requestHistory.length;
  }
}

export const bitcoinInscriptionsRateLimiter = new RateLimiter({
  interval: 1000,
  maxRequests: 10,
  timeout: 5000,
});
