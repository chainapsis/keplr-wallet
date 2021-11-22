import { Message } from "./message";

export type MessageSender = Pick<
  browser.runtime.MessageSender,
  "id" | "url" | "tab"
>;

export type FnRequestInteractionOptions = {
  forceOpenWindow?: boolean;
  channel?: string;
};

export type FnRequestInteraction = <M extends Message<unknown>>(
  url: string,
  msg: M,
  options?: FnRequestInteractionOptions
) => Promise<M extends Message<infer R> ? R : never>;

export interface Env {
  readonly isInternalMsg: boolean;
  readonly requestInteraction: FnRequestInteraction;
}

export type EnvProducer = (
  sender: MessageSender,
  routerMeta: Record<string, any>
) => Env;

export interface MessageRequester {
  sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never>;
}

export type Guard = (
  env: Omit<Env, "requestInteraction">,
  msg: Message<unknown>,
  sender: MessageSender
) => Promise<void>;
