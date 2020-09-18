import { Message } from "../message";

import EventEmitter = NodeJS.EventEmitter;

let lastSequence = 0;

export async function sendMessage<M extends Message<unknown>>(
  opts: {
    emitter: EventEmitter;
    id: string;
    url: string;
    origin: string;
  },
  port: string,
  msg: M
): Promise<M extends Message<infer R> ? R : never> {
  msg.validateBasic();

  return new Promise((resolve, reject) => {
    const sequence = lastSequence + 1;
    lastSequence++;

    opts.emitter.once(`message-result-${sequence}`, result => {
      if (!result) {
        reject(Error("Null result"));
        return;
      }

      if (result.error) {
        reject(new Error(result.error));
        return;
      }

      resolve(result.return);
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    msg["origin"] = opts.origin;

    opts.emitter.emit("message", {
      port,
      type: msg.type(),
      msg,
      sequence,
      sender: {
        id: opts.id,
        url: opts.url
      }
    });
  });
}
