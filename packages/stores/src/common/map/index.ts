import { makeObservable, observable, runInAction } from "mobx";

export class HasMapStore<T> {
  @observable.shallow
  protected map: Map<string, T> = new Map();

  constructor(protected readonly creater: (key: string) => T) {
    makeObservable(this);
  }

  protected get(key: string): T {
    if (!this.map.has(key)) {
      const query = this.creater(key);

      runInAction(() => {
        this.map.set(key, query);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(key)!;
  }

  protected has(key: string): boolean {
    return this.map.has(key);
  }
}
