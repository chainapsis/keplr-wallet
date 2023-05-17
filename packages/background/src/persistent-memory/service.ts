export class PersistentMemoryService {
  data: any = {};

  init() {
    // noop
  }

  set(data: any) {
    this.data = { ...this.data, ...data };
  }

  get(): any {
    return this.data;
  }
}
