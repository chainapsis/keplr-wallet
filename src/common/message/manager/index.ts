import { Message } from "../message";
import { Handler } from "../handler";
import { Result } from "../interfaces";
import { Env, MessageSender } from "../types";

export class MessageManager {
  private registeredMsgType: Map<
    string,
    { new (): Message<unknown> }
  > = new Map();
  private registeredHandler: Map<string, Handler> = new Map();

  protected port = "";

  constructor(protected readonly isContentScripts: boolean = false) {}

  public registerMessage(
    msgCls: { new (...args: any): Message<unknown> } & { type(): string }
  ): void {
    if (this.registeredMsgType.has(msgCls.type())) {
      throw new Error(`Already registered type ${msgCls.type()}`);
    }

    this.registeredMsgType.set(msgCls.type(), msgCls);
  }

  public addHandler(route: string, handler: Handler) {
    if (this.registeredHandler.has(route)) {
      throw new Error(`Already registered type ${route}`);
    }

    this.registeredHandler.set(route, handler);
  }

  public listen(port: string) {
    if (!port) {
      throw new Error("Empty port");
    }

    this.port = port;
    browser.runtime.onMessage.addListener(this.onMessage);
    if (browser.runtime.onMessageExternal) {
      browser.runtime.onMessageExternal.addListener(this.onMessage);
    }
  }

  public unlisten(): void {
    this.port = "";
    browser.runtime.onMessage.removeListener(this.onMessage);
    if (browser.runtime.onMessageExternal) {
      browser.runtime.onMessageExternal.removeListener(this.onMessage);
    }
  }

  protected produceEnv(): Env {
    return {
      extensionId: browser.runtime.id,
      extensionBaseURL: browser.runtime.getURL("/")
    };
  }

  protected checkOriginIsValid(
    message: Message<unknown>,
    sender: MessageSender
  ): boolean {
    if (!message.origin) {
      throw new Error("origin is empty");
    }

    // If manager is on the content scripts, the message doesn't have the url field.
    // TODO: Split the logic via middleware pattern.
    if (this.isContentScripts) {
      const env = this.produceEnv();
      return (
        sender.id === env.extensionId &&
        message.origin === new URL(env.extensionBaseURL).origin
      );
    }

    // TODO: When is a url undefined?
    if (!sender.url) {
      throw new Error("url is empty");
    }

    const url = new URL(sender.url);
    return url.origin === message.origin;
  }

  protected checkMessageIsInternal(env: Env, sender: MessageSender): boolean {
    // If manager is on the content scripts, the message doesn't have the url field.
    // TODO: Split the logic via middleware pattern.
    if (this.isContentScripts) {
      const env = this.produceEnv();
      return sender.id === env.extensionId;
    }

    if (!sender.url) {
      return false;
    }
    const url = new URL(sender.url);
    if (!url.origin || url.origin === "null") {
      throw new Error("Invalid sender url");
    }

    const browserURL = new URL(env.extensionBaseURL);
    if (!browserURL.origin || browserURL.origin === "null") {
      throw new Error("Invalid browser url");
    }

    if (url.origin !== browserURL.origin) {
      return false;
    }

    return sender.id === env.extensionId;
  }

  protected onMessage = (
    message: any,
    sender: MessageSender
  ): Promise<Result> | undefined => {
    if (message.port !== this.port) {
      return;
    }

    try {
      // console.log(
      //   `Message is requested (type: ${message?.type}, origin: ${message?.msg?.origin})`
      // );

      if (!message?.type) {
        return Promise.resolve({
          error: "Null type"
        });
      }

      const msgCls = this.registeredMsgType.get(message.type);
      if (!msgCls) {
        return Promise.resolve({
          error: `Unregistered msg type ${message.type}`
        });
      }
      const msg = Object.setPrototypeOf(
        message.msg,
        msgCls.prototype
      ) as Message<unknown>;

      try {
        if (!this.checkOriginIsValid(msg, sender)) {
          return Promise.resolve({
            error: "Invalid origin"
          });
        }
      } catch (e) {
        if (e) {
          console.log(
            `${msg.type()}'s origin is invalid: ${e.message || e.toString()}`
          );

          return Promise.resolve({
            error: `Invalid origin: ${e.message || e.toString()}`
          });
        } else {
          return Promise.resolve({
            error: "Invalid origin"
          });
        }
      }

      try {
        if (
          !this.checkMessageIsInternal(this.produceEnv(), sender) &&
          !msg.approveExternal(this.produceEnv(), sender)
        ) {
          return Promise.resolve({
            error: "Permission rejected"
          });
        }
      } catch (e) {
        if (e) {
          console.log(
            `${msg.type()} is rejected: ${e.message || e.toString()}`
          );

          return Promise.resolve({
            error: `Permission rejected: ${e.message || e.toString()}`
          });
        } else {
          return Promise.resolve({
            error: "Permission rejected, and error is null"
          });
        }
      }

      try {
        // Can happen throw
        msg.validateBasic();
      } catch (e) {
        if (e) {
          console.log(
            `${msg.type()} is not valid: ${e.message || e.toString()}`
          );

          return Promise.resolve({
            error: e.message || e.toString()
          });
        } else {
          return Promise.resolve({
            error: "Fail to validate msg, and error is null"
          });
        }
      }

      const route = msg.route();
      if (!route) {
        return Promise.resolve({
          error: "Null route"
        });
      }
      const handler = this.registeredHandler.get(route);
      if (!handler) {
        return Promise.resolve({
          error: "Can't get handler"
        });
      }

      try {
        return new Promise(resolve => {
          Promise.resolve(handler(this.produceEnv(), msg))
            .then(result => {
              resolve({ return: result });
            })
            .catch(e => {
              if (e) {
                console.log(
                  `${msg.type()} occurs error: ${e.message || e.toString()}`
                );

                resolve({
                  error: e.message || e.toString()
                });
              } else {
                resolve({
                  error: "Unknown error, and error is null"
                });
              }
            });
        });
      } catch (e) {
        console.log(`${msg.type()} occurs error: ${e.message || e.toString()}`);

        return Promise.resolve({
          error: e.message || e.toString()
        });
      }
    } catch (e) {
      if (e) {
        return Promise.resolve({
          error: e.message || e.toString()
        });
      } else {
        return Promise.resolve({
          error: "Unknown error, and error is null"
        });
      }
    }
  };
}
