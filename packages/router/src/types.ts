import { Message } from "./message";

export type MessageSender = Pick<
  browser.runtime.MessageSender,
  "id" | "url" | "tab"
>;

export type FnRequestInteractionOptions = {
  // If possible, the callback below is called when the popup is closed.
  // In the case of the logic inside the extension, it is difficult to measure when the callback below should be invoked.
  // Therefore, logic should not completely depend on the callback below.
  // In the case of a detached popup, it is not guaranteed that any logic will be executed when it is closed.
  // To solve this problem, the callback below is used.
  unstableOnClose?: () => void;
  // extension에서 window가 이미 열려있다면 uri를 env 단에서 바꾸지 않는다.
  // side panel 기능이 추가되면서 popup/side panel에서의 interaction system을 최대한 동일하게 가져가기 위해서 추가됨.
  ignoreURIReplacement?: boolean;
};

export type FnRequestInteraction = <M extends Message<unknown>>(
  url: string,
  msg: M,
  options?: FnRequestInteractionOptions
) => Promise<M extends Message<infer R> ? R : never>;

export interface Env {
  readonly isInternalMsg: boolean;
  readonly requestInteraction: FnRequestInteraction;
  readonly sender: MessageSender;
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
