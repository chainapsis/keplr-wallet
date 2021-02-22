import { MessageRequester } from "../types";
import { Message } from "../message";
import { Result } from "../interfaces";
import { JSONUint8Array } from "../json-uint8-array";

export interface ProxyMessage {
  type: "proxy-message";
  id: string;
  port: string;
  msg: Message<unknown>;
  msgType: string;
}

export interface ProxyMessageResult {
  type: "proxy-message-result";
  id: string;
  result: Result | undefined;
}

export class InjectedMessageRequester implements MessageRequester {
  public static startProxy() {
    window.addEventListener("message", (e: any) => {
      const message: ProxyMessage = e.data;
      if (!message || message.type !== "proxy-message") {
        return;
      }

      if (!message.id) {
        throw new Error("Empty id");
      }

      InjectedMessageRequester.sendMessageFromProxy(
        message.port,
        message.msg,
        message.msgType
      ).then((result) => {
        const proxyMsgResult: ProxyMessageResult = {
          type: "proxy-message-result",
          id: message.id,
          result: JSONUint8Array.wrap(result),
        };

        window.postMessage(proxyMsgResult, window.location.origin);
      });
    });
  }

  protected static async sendMessageFromProxy(
    port: string,
    msg: Message<unknown>,
    msgType: string
  ): Promise<any> {
    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] = window.location.origin;

    return browser.runtime.sendMessage({
      port,
      type: msgType,
      msg,
    });
  }

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyMessage = {
      type: "proxy-message",
      id,
      port,
      msg: JSONUint8Array.wrap(msg),
      msgType: msg.type(),
    };

    return new Promise((resolve, reject) => {
      const receiveResult = (e: any) => {
        const proxyMsgResult: ProxyMessageResult = e.data;

        if (!proxyMsgResult || proxyMsgResult.type !== "proxy-message-result") {
          return;
        }

        if (proxyMsgResult.id !== id) {
          return;
        }

        window.removeEventListener("message", receiveResult);

        const result = JSONUint8Array.unwrap(proxyMsgResult.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result.return);
      };

      window.addEventListener("message", receiveResult);

      window.postMessage(proxyMessage, window.location.origin);
    });
  }
}
