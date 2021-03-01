import { Message } from "../message";
import { Handler } from "../handler";
import { EnvProducer, Guard } from "../types";
import { MessageRegistry } from "../encoding";

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
}
