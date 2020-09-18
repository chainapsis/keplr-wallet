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
    browser.runtime.onMessageExternal.addListener(this.onMessage);
  }

  public unlisten(): void {
    this.port = "";
    browser.runtime.onMessage.removeListener(this.onMessage);
    browser.runtime.onMessageExternal.removeListener(this.onMessage);
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
    // TODO: When is a url undefined?
    if (!sender.url) {
      throw new Error("url is empty");
    }

    if (!message.origin) {
      throw new Error("origin is empty");
    }

    const url = new URL(sender.url);
    return url.origin === message.origin;
  }

  protected checkMessageIsInternal(env: Env, sender: MessageSender): boolean {
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
    sender: MessageSender,
    sendResponse: (response: Result) => void
  ) => {
    if (message.port !== this.port) {
      return;
    }

    try {
      // console.log(
      //   `Message is requested (type: ${message?.type}, origin: ${message?.msg?.origin})`
      // );

      if (!message?.type) {
        sendResponse({
          error: "Null type"
        });
        return;
      }

      const msgCls = this.registeredMsgType.get(message.type);
      if (!msgCls) {
        sendResponse({
          error: `Unregistered msg type ${message.type}`
        });
        return;
      }
      const msg = Object.setPrototypeOf(
        message.msg,
        msgCls.prototype
      ) as Message<unknown>;

      try {
        if (!this.checkOriginIsValid(msg, sender)) {
          sendResponse({
            error: "Invalid origin"
          });
          return;
        }
      } catch (e) {
        if (e) {
          sendResponse({
            error: `Invalid origin: ${e.message || e.toString()}`
          });

          console.log(
            `${msg.type()}'s origin is invalid: ${e.message || e.toString()}`
          );
        } else {
          sendResponse({
            error: "Invalid origin"
          });
        }
        return;
      }

      try {
        if (
          !this.checkMessageIsInternal(this.produceEnv(), sender) &&
          !msg.approveExternal(this.produceEnv(), sender)
        ) {
          sendResponse({
            error: "Permission rejected"
          });
          return;
        }
      } catch (e) {
        if (e) {
          sendResponse({
            error: `Permission rejected: ${e.message || e.toString()}`
          });

          console.log(
            `${msg.type()} is rejected: ${e.message || e.toString()}`
          );
        } else {
          sendResponse({
            error: "Permission rejected, and error is null"
          });
        }
        return;
      }

      try {
        // Can happen throw
        msg.validateBasic();
      } catch (e) {
        if (e) {
          sendResponse({
            error: e.message || e.toString()
          });

          console.log(
            `${msg.type()} is not valid: ${e.message || e.toString()}`
          );
        } else {
          sendResponse({
            error: "Fail to validate msg, and error is null"
          });
        }
        return;
      }

      const route = msg.route();
      if (!route) {
        sendResponse({
          error: "Null route"
        });
        return;
      }
      const handler = this.registeredHandler.get(route);
      if (!handler) {
        sendResponse({
          error: "Can't get handler"
        });
        return;
      }

      try {
        const promise = Promise.resolve(handler(this.produceEnv(), msg));
        promise
          .then(result => {
            sendResponse({
              return: result
            });
          })
          .catch(e => {
            if (e) {
              sendResponse({
                error: e.message || e.toString()
              });

              console.log(
                `${msg.type()} occurs error: ${e.message || e.toString()}`
              );
            } else {
              sendResponse({
                error: "Unknown error, and error is null"
              });
            }
          });

        return true;
      } catch (e) {
        sendResponse({
          error: e.message || e.toString()
        });

        console.log(`${msg.type()} occurs error: ${e.message || e.toString()}`);
        return;
      }
    } catch (e) {
      if (e) {
        sendResponse({
          error: e.message || e.toString()
        });
      } else {
        sendResponse({
          error: "Unknown error, and error is null"
        });
      }
      return;
    }
  };
}
