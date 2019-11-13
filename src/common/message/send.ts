import { Message } from "./message";
import { Result } from "./interfaces";

function _sendMessage(
  port: string,
  msg: Message<unknown>,
  opts: { msgType?: string } = {}
): Promise<any> {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        port,
        type: opts.msgType || msg.type(),
        msg
      },
      (result?: Result) => {
        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message);
        }

        resolve(result);
      }
    );
  });
}

/**
 * Send message to other process and receive result.
 * This checks if the process that sends message is extension process.
 * And if it is not, it executes not sending but posting automatically.
 * @param port Port that this sends to
 * @param msg Message to send
 */
export async function sendMessage<M extends Message<unknown>>(
  port: string,
  msg: M
): Promise<M extends Message<infer R> ? R : never> {
  const result = await _sendMessage(port, msg);

  if (!result) {
    throw new Error("Null result");
  }

  if (result.error) {
    throw new Error(result.error);
  }

  return result.return;
}

export interface ProxyMessage {
  type: "proxy-message";
  msgType: string;
  index: string;
  port: string;
  msg: Message<unknown>;
}

export interface ProxyMessageResult {
  type: "proxy-message-result";
  index: string;
  result: Result | undefined;
}

/**
 * This sends and recieve returns by proxy.
 * This is mainly used in inpage script for communicating background process via proxy.
 */
export function postMessage<M extends Message<unknown>>(
  port: string,
  msg: M
): Promise<M extends Message<infer R> ? R : never> {
  const bytes = new Uint8Array(8);
  const index: string = Array.from(crypto.getRandomValues(bytes))
    .map(value => {
      return value.toString(16);
    })
    .join("");

  return new Promise((resolve, reject) => {
    const receiveResult = (e: any) => {
      const proxyMsgResult: ProxyMessageResult = e.data;

      if (!proxyMsgResult || proxyMsgResult.type !== "proxy-message-result") {
        return;
      }

      if (proxyMsgResult.index !== index) {
        return;
      }

      window.removeEventListener("message", receiveResult);

      const result = proxyMsgResult.result;

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

    const proxyMsg: ProxyMessage = {
      type: "proxy-message",
      msgType: msg.type(),
      index,
      port,
      msg
    };

    window.postMessage(proxyMsg, "*");
  });
}

/**
 * Proxy posted message for the pages that are not able to communicate background proccess directly.
 */
export function listenAndProxyMessages(): void {
  window.addEventListener("message", (e: any) => {
    const message: ProxyMessage = e.data;
    if (!message || message.type !== "proxy-message") {
      return;
    }

    if (!message.index) {
      throw new Error("Empty index");
    }

    _sendMessage(message.port, message.msg, {
      msgType: message.msgType
    }).then(result => {
      const proxyMsgResult: ProxyMessageResult = {
        type: "proxy-message-result",
        index: message.index,
        result
      };

      window.postMessage(proxyMsgResult, "*");
    });
  });
}
