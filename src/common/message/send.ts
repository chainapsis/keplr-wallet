import { Message } from "./message";
import { Result } from "./interfaces";

function _sendMessage(
  port: string,
  msg: Message,
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

export async function sendMessage<T = any>(
  port: string,
  msg: Message
): Promise<T> {
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
  msg: Message;
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
export function postMessage<T>(port: string, msg: Message): Promise<T> {
  const bytes = new Uint8Array(8);
  const index: string = Array.from(crypto.getRandomValues(bytes))
    .map(value => {
      return value.toString(16);
    })
    .join("");

  return new Promise(resolve => {
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
        throw new Error("Result is null");
      }

      if (result.error) {
        throw new Error(result.error);
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
export function proxyMessage(): void {
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
