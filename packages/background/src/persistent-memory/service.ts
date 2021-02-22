import { singleton } from "tsyringe";

@singleton()
export class PersistentMemoryService {
  data: any = {};

  set(data: any) {
    this.data = { ...this.data, ...data };
  }

  get(): any {
    return this.data;
  }
}
