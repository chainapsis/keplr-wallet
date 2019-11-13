export class PersistentMemoryKeeper {
  data: any = {};

  set(data: any) {
    this.data = { ...this.data, ...data };
  }

  get(): any {
    return this.data;
  }
}
