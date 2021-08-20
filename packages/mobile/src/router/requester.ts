import { Message, MessageRequester, Result } from "@keplr-wallet/router";
import { JSONUint8Array } from "@keplr-wallet/router/build/json-uint8-array";
import EventEmitter from "eventemitter3";
import { RNRouterBackground, RNRouterUI } from "./rn-router";

export class RNMessageRequesterBase implements MessageRequester {
  constructor(protected readonly eventEmitter: EventEmitter) {}

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] = "react-native://internal";

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
            // WARNING: Currently, handle the message only as internal.
            id: "react-native",
            url: "react-native://internal",
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

export class RNMessageRequesterInternal extends RNMessageRequesterBase {
  constructor() {
    super(RNRouterBackground.EventEmitter);
  }
}

export class RNMessageRequesterInternalToUI extends RNMessageRequesterBase {
  constructor() {
    super(RNRouterUI.EventEmitter);
  }
}
