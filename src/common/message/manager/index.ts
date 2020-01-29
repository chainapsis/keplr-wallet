import { Message } from "../message";
import { Handler } from "../handler";
import { Result } from "../interfaces";
import { MessageSender } from "../types";

export class MessageManager {
  private registeredMsgType: Map<
    string,
    { new (): Message<unknown> }
  > = new Map();
  private registeredHandler: Map<string, Handler> = new Map();

  protected port = "";

  public registerMessage(
    msgCls: { new (): Message<unknown> } & { type(): string }
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

  protected onMessage = (
    message: any,
    sender: MessageSender,
    sendResponse: (response: Result) => void
  ) => {
    if (message.port !== this.port) {
      return;
    }

    try {
      if (!message.type) {
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
        if (!msg.approveExternal(sender)) {
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
        const promise = Promise.resolve(handler(msg));
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
