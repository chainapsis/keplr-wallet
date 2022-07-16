import {
  EnvProducer,
  KeplrError,
  MessageSender,
  Result,
  Router as AbstractRouter,
} from "@keplr-wallet/router";
import EventEmitter from "eventemitter3";

export class Router extends AbstractRouter {
  constructor(
    protected readonly envProducer: EnvProducer,
    protected readonly eventEmitter: EventEmitter
  ) {
    super(envProducer);
  }

  listen(port: string): void {
    if (!port) {
      throw new Error("Empty port");
    }

    this.port = port;
    this.eventEmitter.addListener("message", this.onMessage);
  }

  unlisten(): void {
    this.port = "";
    this.eventEmitter.removeListener("message", this.onMessage);
  }

  protected onMessage = (
    message: any,
    sender: MessageSender
  ): Promise<Result> | undefined => {
    if (message.port !== this.port) {
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

export class RouterBackground extends Router {
  public static readonly EventEmitter: EventEmitter = new EventEmitter();

  constructor(protected readonly envProducer: EnvProducer) {
    super(envProducer, RouterBackground.EventEmitter);
  }
}

export class RouterUi extends Router {
  public static readonly EventEmitter: EventEmitter = new EventEmitter();

  constructor(protected readonly envProducer: EnvProducer) {
    super(envProducer, RouterUi.EventEmitter);
  }
}
