import { Message } from "./message";
import { Result } from "./interfaces";

export function sendMessage<T = any>(port: string, msg: Message): Promise<T> {
  // TODO: handle reject.
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        port,
        type: msg.type(),
        msg
      },
      (result?: Result) => {
        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message);
        }

        if (!result) {
          throw new Error("Null result");
        }

        if (result.error) {
          throw new Error(result.error);
        }

        resolve(result.return);
      }
    );
  });
}
