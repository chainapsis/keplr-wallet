import { Message } from "./message";
import { Env } from "./types";

export type Handler = (env: Env, msg: Message<unknown>) => any;
export type InternalHandler<M extends Message<unknown>> = (
  env: Env,
  msg: M
) =>
  | (M extends Message<infer R> ? R : never)
  | Promise<M extends Message<infer R> ? R : never>;
