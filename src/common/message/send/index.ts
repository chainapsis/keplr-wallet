import { Message } from "../message";
import { Result } from "../interfaces";

function _sendMessage(
  port: string,
  msg: Message<unknown>,
  opts: { msgType?: string } = {}
): Promise<any> {
  // Set message's origin.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  msg["origin"] = window.location.origin;
  console.log(msg.origin);
  return browser.runtime.sendMessage({
    port,
    type: opts.msgType || msg.type(),
    msg
  });
}

/**
 * Send message to other process and receive result.
 * This checks if the process that sends message is extension process.
 * And if it is not, it executes not sending but posting automatically.
 * @param port Port that this sends to
 * @param msg Message to send
 * @param opts If disablePostMessage is true, this doesn't check if the process that sends message is extension process.
 */
export async function sendMessage<M extends Message<unknown>>(
  port: string,
  msg: M,
  opts: {
    disablePostMessage: boolean;
  } = {
    disablePostMessage: false
  }
): Promise<M extends Message<infer R> ? R : never> {
  msg.validateBasic();
  let posting: boolean = false;

  if (!opts || !opts.disablePostMessage) {
    if (typeof browser === "undefined") {
      posting = true;
    } else {
      posting = browser?.runtime?.id == null;
    }
  }

  if (posting) {
    return (await postMessage(port, msg)) as any;
  }

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
  id: string;
  port: string;
  msg: Message<unknown>;
}

export interface ProxyMessageResult {
  type: "proxy-message-result";
  id: string;
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
  msg.validateBasic();
  const bytes = new Uint8Array(8);
  const id: string = Array.from(crypto.getRandomValues(bytes))
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

      if (proxyMsgResult.id !== id) {
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
      id,
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

    if (!message.id) {
      throw new Error("Empty id");
    }

    _sendMessage(message.port, message.msg, {
      msgType: message.msgType
    }).then(result => {
      const proxyMsgResult: ProxyMessageResult = {
        type: "proxy-message-result",
        id: message.id,
        result
      };

      window.postMessage(proxyMsgResult, "*");
    });
  });
}
