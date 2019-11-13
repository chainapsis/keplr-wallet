import { Message } from "../../common/message";
import { ROUTE } from "./constants";

export class SetPersistentMemoryMsg extends Message<{ success: boolean }> {
  public static type() {
    return "set-persistent-memory";
  }

  public static create(data: any): SetPersistentMemoryMsg {
    const msg = new SetPersistentMemoryMsg();
    msg.data = data;
    return msg;
  }

  public data = {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetPersistentMemoryMsg.type();
  }
}

export class GetPersistentMemoryMsg extends Message<any> {
  public static type() {
    return "get-persistent-memory";
  }

  public static create(): GetPersistentMemoryMsg {
    return new GetPersistentMemoryMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetPersistentMemoryMsg.type();
  }
}
