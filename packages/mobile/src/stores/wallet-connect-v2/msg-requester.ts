import {
  Message,
  MessageRequester,
  Result,
  JSONUint8Array,
  KeplrError,
} from "@keplr-wallet/router";
import EventEmitter from "eventemitter3";

export class WCV2MessageRequester implements MessageRequester {
  constructor(
    protected readonly eventEmitter: EventEmitter,
    protected readonly topic: string
  ) {}

  static getVirtualURL = (topic: string): string => {
    return `https://keplr_wc@v2_virtual.${topic}`;
  };

  static isVirtualURL = (url: string): boolean => {
    return url.startsWith("https://keplr_wc@v2_virtual.");
  };

  static getTopicFromVirtualURL = (url: string): string => {
    if (!WCV2MessageRequester.isVirtualURL(url)) {
      throw new Error("URL is not for wallet connect v2");
    }

    return url.replace("https://keplr_wc@v2_virtual.", "").replace("/", "");
  };

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // In the router and background, the origin should be formed as proper URL.
    // But, actually there is no expilicit and reliable URL in the wallet connect system.
    // Rather than handling the wallet connect with different logic, just set the URL as virtually formed URL with session id.
    const url = WCV2MessageRequester.getVirtualURL(this.topic);

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
      if (typeof result.error === "string") {
        throw new Error(result.error);
      } else {
        throw new KeplrError(
          result.error.module,
          result.error.code,
          result.error.message
        );
      }
    }

    return result.return;
  }
}
