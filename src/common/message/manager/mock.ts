import { MessageManager } from "./index";
import { Result } from "../interfaces";

import EventEmitter = NodeJS.EventEmitter;

export class MockMessageManager extends MessageManager {
  constructor(
    private readonly emitter: EventEmitter,
    private readonly id: string
  ) {
    super();
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

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      // Force injecting very minimal browser api.
      global.browser = {
        runtime: {
          id: this.id,
          getURL: (path: string) => {
            if (path.length > 0 && path[0] === "/") {
              path = path.substring(1);
            }

            return `http://${this.id}/${path}`;
          }
        }
      };
      this.onMessage(message, sender, (result: Result) => {
        this.emitter.emit(`message-result-${sequence}`, result);
      });
    });
  }
}
