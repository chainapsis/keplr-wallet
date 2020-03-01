export class AsyncMutex {
  private _isLocked: boolean = false;
  private resolvers: Array<() => void> = [];

  async lock(): Promise<void> {
    if (!this.isLocked) {
      this._isLocked = true;
      return;
    }

    return new Promise(resolve => {
      this.resolvers.push(resolve);
    });
  }

  unlock(): void {
    if (this.isLocked) {
      const resolver = this.resolvers.shift();
      if (resolver) {
        resolver();
      } else {
        this._isLocked = false;
      }
    } else {
      throw new Error("Mutex is not locked");
    }
  }

  get isLocked(): boolean {
    return this._isLocked;
  }
}
