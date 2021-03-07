import { MessageSender, Result, Router } from "@keplr-wallet/router";

import EventEmitter from "eventemitter3";

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

  protected onMessage = async (params: {
    message: any;
    sender: MessageSender & {
      resolver: (result: Result) => void;
    };
  }): Promise<void> => {
    const { message, sender } = params;
    if (message.port !== this.port) {
      return;
    }

    try {
      const result = await this.handleMessage(message, sender);
      sender.resolver({
        return: result,
      });
      return;
    } catch (e) {
      console.log(
        `Failed to process msg ${message.type}: ${e?.message || e?.toString()}`
      );
      if (e) {
        sender.resolver({
          error: e.message || e.toString(),
        });
      } else {
        sender.resolver({
          error: "Unknown error, and error is null",
        });
      }
    }
  };
}
