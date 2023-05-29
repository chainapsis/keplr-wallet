import {
  Router,
  MessageSender,
  Result,
  KeplrError,
} from "@keplr-wallet/router";
import { EventEmitter } from "events";

export class MockRouter extends Router {
  public static eventEmitter = new EventEmitter();

  protected attachHandler() {
    MockRouter.eventEmitter.addListener("message", this.onMessage);
  }

  protected detachHandler() {
    MockRouter.eventEmitter.removeListener("message", this.onMessage);
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
      if (e instanceof KeplrError) {
        sender.resolver({
          error: {
            code: e.code,
            module: e.module,
            message: e.message || e.toString(),
          },
        });
      } else if (e) {
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
