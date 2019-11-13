import { Message } from "./message";

export type Handler = (msg: Message<unknown>) => any;
export type InternalHandler<M extends Message<unknown>> = (
  msg: M
) =>
  | (M extends Message<infer R> ? R : never)
  | (Promise<M extends Message<infer R> ? R : never>);
