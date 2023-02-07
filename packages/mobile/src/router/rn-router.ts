import {
  EnvProducer,
  KeplrError,
  MessageSender,
  Result,
  Router,
} from "@keplr-wallet/router";

import EventEmitter from "eventemitter3";

export class RNRouterBase extends Router {
  constructor(
    protected readonly envProducer: EnvProducer,
    protected readonly eventEmitter: EventEmitter
  ) {
    super(envProducer);
  }

  protected attachHandler() {
    this.eventEmitter.addListener("message", this.onMessage);
  }

  protected detachHandler() {
    this.eventEmitter.removeListener("message", this.onMessage);
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

export class RNRouterBackground extends RNRouterBase {
  public static readonly EventEmitter: EventEmitter = new EventEmitter();

  constructor(protected readonly envProducer: EnvProducer) {
    super(envProducer, RNRouterBackground.EventEmitter);
  }
}

export class RNRouterUI extends RNRouterBase {
  public static readonly EventEmitter: EventEmitter = new EventEmitter();

  constructor(protected readonly envProducer: EnvProducer) {
    super(envProducer, RNRouterUI.EventEmitter);
  }
}
