import { Message, MessageRequester, Result } from "@keplr-wallet/router";
import { JSONUint8Array } from "@keplr-wallet/router/build/json-uint8-array";
import EventEmitter from "eventemitter3";

export class WCMessageRequester implements MessageRequester {
  constructor(
    protected readonly eventEmitter: EventEmitter,
    protected readonly sessionId: string
  ) {}

  static getVirtualSessionURL = (sessionId: string): string => {
    return `https://keplr_wc_virtual.${sessionId}`;
  };

  static isVirtualSessionURL = (url: string): boolean => {
    return url.startsWith("https://keplr_wc_virtual.");
  };

  static getSessionIdFromVirtualURL = (url: string): string => {
    if (!WCMessageRequester.isVirtualSessionURL(url)) {
      throw new Error("URL is not for wallet connect");
    }

    return url.replace("https://keplr_wc_virtual.", "").replace("/", "");
  };

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // In the router and background, the origin should be formed as proper URL.
    // But, actually there is no expilicit and reliable URL in the wallet connect system.
    // Rather than handling the wallet connect with different logic, just set the URL as virtually formed URL with session id.
    const url = WCMessageRequester.getVirtualSessionURL(this.sessionId);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] = url;

    if (this.eventEmitter.listenerCount("message") === 0) {
      throw new Error("There is no router to send");
    }

    const result: Result = JSONUint8Array.unwrap(
      await new Promise((resolve) => {
        this.eventEmitter.emit("message", {
          message: {
            port,
            type: msg.type(),
            msg: JSONUint8Array.wrap(msg),
          },
          sender: {
            id: "react-native",
            url,
            resolver: resolve,
          },
        });
      })
    );

    if (!result) {
      throw new Error("Null result");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }
}
