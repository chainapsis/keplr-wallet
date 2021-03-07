import { Message, MessageRequester, Result } from "@keplr-wallet/router";
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

    const result: Result = JSONUint8Array.unwrap(
      await new Promise((resolve) => {
        RNRouter.EventEmitter.emit("message", {
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
