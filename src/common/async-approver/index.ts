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

  private readonly validateId: (id: string) => void;
  private readonly defaultTimeout: number = 0;

  constructor(
    opts: {
      validateId?: (id: string) => void;
      defaultTimeout?: number;
    } = {}
  ) {
    if (!opts?.validateId) {
      this.validateId = (id: string): void => {
        AsyncApprover.isValidId(id);
      };
    } else {
      this.validateId = opts.validateId;
    }

    if (opts?.defaultTimeout) {
      this.defaultTimeout = opts.defaultTimeout;
    }
  }

  async request(
    id: string,
    data?: T,
    timeout: number = this.defaultTimeout
  ): Promise<R | undefined> {
    this.validateId(id);

    if (timeout) {
      setTimeout(() => {
        try {
          this.reject(id);
        } catch {
          // noop
        }
      }, timeout);
    }

    return new Promise<R>((resolve, reject) => {
      this.requests.set(id, {
        data,
        resolve,
        reject
      });
    });
  }

  approve(id: string, result?: R): void {
    this.validateId(id);

    const resolver = this.requests.get(id);
    if (!resolver) {
      throw new Error("Unknown request id");
    }

    this.requests.delete(id);
    resolver.resolve(result);
  }

  reject(id: string): void {
    this.validateId(id);

    const resolver = this.requests.get(id);
    if (!resolver) {
      throw new Error("Unknown request id");
    }

    this.requests.delete(id);
    resolver.reject(new Error("Request rejected"));
  }

  getData(id: string): T | undefined {
    const resolver = this.requests.get(id);
    if (!resolver) {
      throw new Error("Unknown request id");
    }

    return resolver.data;
  }

  public static isValidId(id: string) {
    if (!id || id.length < 4) {
      throw new Error("Too short id");
    }

    if (id.length > 8) {
      throw new Error("Too long id");
    }
  }
}
