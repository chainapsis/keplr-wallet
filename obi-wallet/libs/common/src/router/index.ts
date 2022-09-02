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
    this.eventEmitter.addListener("message", this.onMessage.bind(this));
  }

  unlisten(): void {
    this.port = "";
    this.eventEmitter.removeListener("message", this.onMessage.bind(this));
  }

  protected async onMessage({
    message,
    sender,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any;
    sender: MessageSender & { resolver: (result: Result) => void };
  }) {
    if (message.port !== this.port) return;
    console.log("message", message);
    sender.resolver(await this.onMessageHandler(message, sender));
    console.log("DONE message", message.type);
  }

  protected async onMessageHandler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    sender: MessageSender
  ): Promise<Result> {
    try {
      const result = await this.handleMessage(message, sender);
      return {
        return: result,
      };
    } catch (e) {
      const error = e as Error | null;
      console.log(
        `Failed to process msg ${message.type}: ${
          error?.message || error?.toString()
        }`
      );
      if (error instanceof KeplrError) {
        return Promise.resolve({
          error: {
            code: error.code,
            module: error.module,
            message: error.message || error.toString(),
          },
        });
      } else if (error) {
        return Promise.resolve({
          error: error.message || error.toString(),
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
