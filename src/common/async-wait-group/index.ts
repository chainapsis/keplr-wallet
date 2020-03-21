/**
 * There are no problems such as race condition because javascript is single-threaded language.
 * But, this wait group is used to control the flows of asynchronous operations.
 */
export class AsyncWaitGroup {
  private count: number = 0;
  private resolvers: Array<() => void> = [];

  async wait(): Promise<void> {
    if (this.count === 0) {
      return;
    }

    return new Promise(resolve => {
      this.resolvers.push(resolve);
    });
  }

  add(delta: number = 1): void {
    this.count += delta;
  }

  done(): void {
    if (this.count > 0) {
      this.count--;
      if (this.count === 0) {
        while (this.resolvers.length > 0) {
          const resolver = this.resolvers.shift();
          if (resolver) {
            resolver();
          }
        }
      }
    }
  }

  get isLocked(): boolean {
    return this.count > 0;
  }
}
