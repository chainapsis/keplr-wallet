import { Message } from "./message";
import { MessageRequester } from "./types";

const symbolRoute: unique symbol = Symbol();
const symbolType: unique symbol = Symbol();

export class SimpleMessage<R = any> extends Message<R> {
  protected [symbolRoute]: string;
  protected [symbolType]: string;

  [key: string]: any;

  constructor(route: string, type: string, data: Record<string, any>) {
    super();

    this[symbolRoute] = route;
    this[symbolType] = type;

    for (const key of Object.keys(data)) {
      this[key] = data[key];
    }
  }

  route(): string {
    return this[symbolRoute];
  }

  type(): string {
    return this[symbolType];
  }

  // validateBasic should be handled in background.
  validateBasic(): void {
    // noop
  }

  // approveExternal should be handled in background.
  override approveExternal(): boolean {
    return true;
  }
}

/**
 * Send message without typing and message instance.
 * Usage of this function is not recommended.
 * However, if you know about this function well,
 * and you want to avoid the usage of troublesome typing and class definition,
 * You can try using this function.
 * @param requester
 * @param port
 * @param route
 * @param type
 * @param data
 */
export async function sendSimpleMessage<R = any>(
  requester: MessageRequester,
  port: string,
  route: string,
  type: string,
  data: Record<string, any>
): Promise<R> {
  return await requester.sendMessage(
    port,
    new SimpleMessage(route, type, data)
  );
}
