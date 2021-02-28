import { Message, MessageRequester } from "@keplr-wallet/router";
import { JSONUint8Array } from "@keplr-wallet/router/build/json-uint8-array";
import { RNRouter } from "./rn-router";

export class RNMessageRequester implements MessageRequester {
  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    msg["origin"] = "react-native://internal";

    return new Promise((resolve, reject) => {
      const wrappedMSg = JSONUint8Array.wrap(msg);

      if (
        !RNRouter.EventEmitter.emit("message", {
          port,
          type: msg.type(),
          msg: wrappedMSg,
          sender: {
            // WARNING: Currently, handle the message only as internal.
            id: "react-native",
            url: "react-native://internal",
            resolver: resolve,
            rejector: reject,
          },
        })
      ) {
        reject(new Error("Their is no listener"));
      }
    });
  }
}
