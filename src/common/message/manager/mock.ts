import { MessageManager } from "./index";
import { Result } from "../interfaces";
import { Env } from "../types";

import EventEmitter = NodeJS.EventEmitter;

export class MockMessageManager extends MessageManager {
  constructor(
    private readonly emitter: EventEmitter,
    public readonly extensionId: string,
    public readonly extensionBaseURL: string
  ) {
    super();
  }

  protected produceEnv(): Env {
    return {
      extensionId: this.extensionId,
      extensionBaseURL: this.extensionBaseURL
    };
  }

  public listen(port: string) {
    if (!port) {
      throw new Error("Empty port");
    }

    this.port = port;
    this.emitter.on("message", message => {
      const sender = message.sender;
      delete message.sender;

      const sequence = message.sequence;
      delete message.sequence;

      this.onMessage(message, sender, (result: Result) => {
        this.emitter.emit(`message-result-${sequence}`, result);
      });
    });
  }
}
