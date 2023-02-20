import {
  Router,
  MessageSender,
  Result,
  EnvProducer,
  KeplrError,
} from "@keplr-wallet/router";
import { getKeplrExtensionRouterId } from "../utils";

export class ExtensionRouter extends Router {
  constructor(envProducer: EnvProducer) {
    super(envProducer);
  }

  protected attachHandler() {
    browser.runtime.onMessage.addListener(this.onMessage);
    // Although security considerations cross-extension communication are in place,
    // we have put in additional security measures by disbling extension-to-extension communication until a formal security audit has taken place.
    /*
    if (browser.runtime.onMessageExternal) {
      browser.runtime.onMessageExternal.addListener(this.onMessage);
    }
     */
  }

  protected detachHandler() {
    browser.runtime.onMessage.removeListener(this.onMessage);
    // Although security considerations cross-extension communication are in place,
    // we have put in additional security measures by disbling extension-to-extension communication until a formal security audit has taken place.
    /*
    if (browser.runtime.onMessageExternal) {
      browser.runtime.onMessageExternal.removeListener(this.onMessage);
    }
     */
  }

  // You shouldn't set this handler as async funtion,
  // because mozila's extension polyfill deals with the message handler as resolved if it returns the `Promise`.
  // So, if this handler is async function, it always return the `Promise` if it returns `undefined` and it is dealt with as resolved.
  protected onMessage = (
    message: any,
    sender: MessageSender
  ): Promise<Result> | undefined => {
    if (message.port !== this.port) {
      return;
    }

    // The receiverRouterId will be set when requesting an interaction from the background to the frontend.
    // If this value exists, it compares this value with the current router id and processes them only if they are the same.
    if (
      message.msg?.routerMeta?.receiverRouterId &&
      message.msg.routerMeta.receiverRouterId !== getKeplrExtensionRouterId()
    ) {
      return;
    }

    return this.onMessageHandler(message, sender);
  };

  protected async onMessageHandler(
    message: any,
    sender: MessageSender
  ): Promise<Result> {
    try {
      const result = await this.handleMessage(message, sender);
      return {
        return: result,
      };
    } catch (e) {
      console.log(
        `Failed to process msg ${message.type}: ${e?.message || e?.toString()}`
      );
      if (e instanceof KeplrError) {
        return Promise.resolve({
          error: {
            code: e.code,
            module: e.module,
            message: e.message || e.toString(),
          },
        });
      } else if (e) {
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
