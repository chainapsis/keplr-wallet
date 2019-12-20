/**
 * AsyncApprover approves or rejects some requests asynchronously
 */
export class AsyncApprover<T = unknown, R = void> {
  private requests: Map<
    string,
    {
      data: T | undefined;
      resolve: (value?: R | PromiseLike<R>) => void;
      reject: (reason?: any) => void;
    }
  > = new Map();

  private readonly validateIndex: (index: string) => void;
  private readonly defaultTimeout: number = 0;

  constructor(
    opts: {
      validateIndex?: (index: string) => void;
      defaultTimeout?: number;
    } = {}
  ) {
    if (!opts?.validateIndex) {
      this.validateIndex = (index: string): void => {
        AsyncApprover.isValidIndex(index);
      };
    } else {
      this.validateIndex = opts.validateIndex;
    }

    if (opts?.defaultTimeout) {
      this.defaultTimeout = opts.defaultTimeout;
    }
  }

  async request(
    index: string,
    data?: T,
    timeout: number = this.defaultTimeout
  ): Promise<R | undefined> {
    this.validateIndex(index);

    if (timeout) {
      setTimeout(() => {
        try {
          this.reject(index);
        } catch {
          // noop
        }
      }, timeout);
    }

    return new Promise<R>((resolve, reject) => {
      this.requests.set(index, {
        data,
        resolve,
        reject
      });
    });
  }

  approve(index: string, result?: R): void {
    this.validateIndex(index);

    const resolver = this.requests.get(index);
    if (!resolver) {
      throw new Error("Unknown request index");
    }

    this.requests.delete(index);
    resolver.resolve(result);
  }

  reject(index: string): void {
    this.validateIndex(index);

    const resolver = this.requests.get(index);
    if (!resolver) {
      throw new Error("Unknown request index");
    }

    this.requests.delete(index);
    resolver.reject(new Error("Request rejected"));
  }

  getData(index: string): T | undefined {
    const resolver = this.requests.get(index);
    if (!resolver) {
      throw new Error("Unknown request index");
    }

    return resolver.data;
  }

  public static isValidIndex(index: string) {
    if (!index || index.length < 4) {
      throw new Error("Too short index");
    }

    if (index.length > 8) {
      throw new Error("Too long index");
    }
  }
}
