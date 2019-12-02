/**
 * AsyncApprover approves or rejects some requests asynchronously
 */
export class AsyncApprover {
  private requests: Map<
    string,
    { resolve: () => void; reject: (reason?: any) => void }
  > = new Map();

  // TODO: Add timeout.
  async request(index: string): Promise<void> {
    AsyncApprover.isValidIndex(index);

    if (this.requests.has(index)) {
      throw new Error("index exists");
    }

    return new Promise((resolve, reject) => {
      this.requests.set(index, {
        resolve,
        reject
      });
    });
  }

  approve(index: string): void {
    AsyncApprover.isValidIndex(index);

    const resolver = this.requests.get(index);
    if (!resolver) {
      throw new Error("Unknown request index");
    }

    this.requests.delete(index);
    resolver.resolve();
  }

  reject(index: string): void {
    AsyncApprover.isValidIndex(index);

    const resolver = this.requests.get(index);
    if (!resolver) {
      throw new Error("Unknown request index");
    }

    this.requests.delete(index);
    resolver.reject(new Error("Request rejected"));
  }

  private static isValidIndex(index: string) {
    if (!index || index.length < 4) {
      throw new Error("Too short index");
    }

    if (index.length > 8) {
      throw new Error("Too long index");
    }
  }
}
