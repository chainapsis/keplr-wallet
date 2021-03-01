import { Router } from "./types";
import { JSONUint8Array } from "../json-uint8-array";
import { MessageSender } from "../types";
import { Result } from "../interfaces";

export class ExtensionRouter extends Router {
  listen(port: string): void {
    if (!port) {
      throw new Error("Empty port");
    }

    this.port = port;
    browser.runtime.onMessage.addListener(this.onMessage);
    if (browser.runtime.onMessageExternal) {
      browser.runtime.onMessageExternal.addListener(this.onMessage);
    }
  }

  unlisten(): void {
    this.port = "";
    browser.runtime.onMessage.removeListener(this.onMessage);
    if (browser.runtime.onMessageExternal) {
      browser.runtime.onMessageExternal.removeListener(this.onMessage);
    }
  }

  // You shouldn't set this handler as async funtion,
  // because mozila's extension polyfill deals with the message handler as resolved if it returns the `Promise`.
  // So, if this handler is async function, it always return the `Promise` if it returns `undefined` and it is dealt with as resolved.
  protected onMessage = (
    message: any,
    sender: MessageSender
  ): Promise<Result | undefined> | undefined => {
    if (message.port !== this.port) {
      return;
    }

    return this.handleMessage(message, sender);
  };

  protected async handleMessage(
    message: any,
    sender: MessageSender
  ): Promise<Result> {
    try {
      const msg = this.msgRegistry.parseMessage(JSONUint8Array.unwrap(message));
      const env = this.envProducer(sender);

      for (const guard of this.guards) {
        await guard(env, msg, sender);
      }

      // Can happen throw
      msg.validateBasic();

      const route = msg.route();
      if (!route) {
        throw new Error("Null router");
      }
      const handler = this.registeredHandler.get(route);
      if (!handler) {
        throw new Error("Can't get handler");
      }

      const result = JSONUint8Array.wrap(await handler(env, msg));
      return Promise.resolve({
        return: result,
      });
    } catch (e) {
      console.log(
        `Failed to process msg ${message.type}: ${e?.message || e?.toString()}`
      );
      if (e) {
        return Promise.resolve({
          error: e.message || e.toString(),
        });
      } else {
        return Promise.resolve({
          error: "Unknown error, and error is null",
        });
      }
    }
  }
}
