import {
  JSONUint8Array,
  KeplrError,
  Message,
  MessageRequester as AbstractMessageRequester,
  Result,
} from "@keplr-wallet/router";
import EventEmitter from "eventemitter3";

import { RouterBackground, RouterUi } from "../router";

export class MessageRequester implements AbstractMessageRequester {
  constructor(
    protected eventEmitter: EventEmitter,
    protected sender: { url: string; origin: string }
  ) {}

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();
    // @ts-expect-error
    msg["origin"] = this.sender.origin;

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
            url: this.sender.url,
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

export class MessageRequesterExternal extends MessageRequester {
  constructor(sender: { url: string; origin: string }) {
    super(RouterBackground.EventEmitter, sender);
  }
}

export class MessageRequesterInternal extends MessageRequester {
  constructor() {
    super(RouterBackground.EventEmitter, {
      url: "react-native://internal",
      origin: "react-native://internal",
    });
  }
}

export class MessageRequesterInternalToUi extends MessageRequester {
  constructor() {
    super(RouterUi.EventEmitter, {
      url: "react-native://internal",
      origin: "react-native://internal",
    });
  }
}
