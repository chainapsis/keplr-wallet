import { Message } from "../message";
import { Handler } from "../handler";
import { EnvProducer, Guard, MessageSender } from "../types";
import { MessageRegistry } from "../encoding";
import { JSONUint8Array } from "../json-uint8-array";

export abstract class Router {
  protected msgRegistry: MessageRegistry = new MessageRegistry();
  protected registeredHandler: Map<string, Handler> = new Map();

  protected guards: Guard[] = [];

  protected port = "";

  constructor(protected readonly envProducer: EnvProducer) {}

  public registerMessage(
    msgCls: { new (...args: any): Message<unknown> } & { type(): string }
  ): void {
    this.msgRegistry.registerMessage(msgCls);
  }

  public addHandler(route: string, handler: Handler) {
    if (this.registeredHandler.has(route)) {
      throw new Error(`Already registered type ${route}`);
    }

    this.registeredHandler.set(route, handler);
  }

  public addGuard(guard: Guard): void {
    this.guards.push(guard);
  }

  public abstract listen(port: string): void;

  public abstract unlisten(): void;

  protected async handleMessage(
    message: any,
    sender: MessageSender
  ): Promise<unknown> {
    const msg = this.msgRegistry.parseMessage(JSONUint8Array.unwrap(message));
    const env = this.envProducer(sender, msg.routerMeta ?? {});

    for (const guard of this.guards) {
      await guard(env, msg, sender);
    }

    // Can happen throw
    msg.validateBasic();

    const route = msg.route();
    if (!route) {
      throw new Error("Null router");
    }
    const handler = this.registeredHandler.get(route);
    if (!handler) {
      throw new Error("Can't get handler");
    }

    return JSONUint8Array.wrap(await handler(env, msg));
  }
}
