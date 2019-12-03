/**
 * AsyncApprover approves or rejects some requests asynchronously
 */
export class AsyncApprover<R = void> {
  private requests: Map<
    string,
    {
      resolve: (value?: R | PromiseLike<R>) => void;
      reject: (reason?: any) => void;
    }
  > = new Map();

  /**
   * @param validateIndex Function that validates index. If this is not set, it will validate the index by using `AsyncApprover.isValidIndex(index)`.
   * @param override If override is true, reject the prior request and override when the new reqeust has the same index with prior one.
   */
  constructor(
    private readonly validateIndex: (index: string) => void = (
      index: string
    ) => {
      AsyncApprover.isValidIndex(index);
    },
    private readonly override: boolean = false
  ) {}

  // TODO: Add timeout.
  async request(index: string): Promise<R | undefined> {
    this.validateIndex(index);

    if (this.requests.has(index)) {
      if (!this.override) {
        throw new Error("index exists");
      } else {
        this.reject(index);
      }
    }

    return new Promise<R>((resolve, reject) => {
      this.requests.set(index, {
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

  public static isValidIndex(index: string) {
    if (!index || index.length < 4) {
      throw new Error("Too short index");
    }

    if (index.length > 8) {
      throw new Error("Too long index");
    }
  }
}
