import { InjectedKeplr } from "@keplr-wallet/provider";
import { KeplrMode } from "@keplr-wallet/types";

export class RNInjectedKeplr extends InjectedKeplr {
  static parseWebviewMessage(message: unknown): unknown {
    if (message && typeof message === "string") {
      try {
        return JSON.parse(message);
      } catch {
        // noop
      }
    }

    return message;
  }

  constructor(version: string, mode: KeplrMode) {
    super(
      version,
      mode,
      {
        addMessageListener: (fn: (e: unknown) => void) =>
          window.addEventListener("message", fn),
        removeMessageListener: (fn: (e: unknown) => void) =>
          window.removeEventListener("message", fn),
        postMessage: (message) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        },
      },
      RNInjectedKeplr.parseWebviewMessage
    );
  }
}
