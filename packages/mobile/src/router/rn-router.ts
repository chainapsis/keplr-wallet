import { MessageSender, Router } from "@keplr-wallet/router";

import EventEmitter from "eventemitter3";
import { JSONUint8Array } from "@keplr-wallet/router/build/json-uint8-array";

export class RNRouter extends Router {
  public static readonly EventEmitter: EventEmitter = new EventEmitter();

  listen(port: string): void {
    if (!port) {
      throw new Error("Empty port");
    }

    this.port = port;
    RNRouter.EventEmitter.addListener("message", this.onMessage);
  }

  unlisten(): void {
    this.port = "";
    RNRouter.EventEmitter.removeListener("message", this.onMessage);
  }

  protected onMessage = (message: any): void => {
    if (message.port !== this.port) {
      return;
    }

    const sender = message.sender;

    this.handleMessage(message, sender);
  };

  protected async handleMessage(
    message: any,
    sender: MessageSender & {
      resolver: (result: unknown) => void;
      rejector: (err: Error) => void;
    }
  ): Promise<void> {
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
      sender.resolver(result);
    } catch (e) {
      console.log(
        `Failed to process msg ${message.type}: ${e?.message || e?.toString()}`
      );
      if (e) {
        sender.rejector(e);
      } else {
        sender.rejector(new Error("Unknown error, and error is null"));
      }
    }
  }
}
