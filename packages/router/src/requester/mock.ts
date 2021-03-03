import { MessageRequester } from "../types";
import { Message } from "../message";
import { JSONUint8Array } from "../json-uint8-array";
import { MockRouter } from "../router";
import { Result } from "../interfaces";

export class MockMessageRequester implements MessageRequester {
  constructor(protected readonly id: string, protected readonly url: string) {}

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] = new URL(this.url).origin;

    const result: Result = JSONUint8Array.unwrap(
      await new Promise((resolve) => {
        MockRouter.eventEmitter.emit("message", {
          message: {
            port,
            type: msg.type(),
            msg: JSONUint8Array.wrap(msg),
          },
          sender: {
            id: this.id,
            url: this.url,
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
