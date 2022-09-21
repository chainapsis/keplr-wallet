import { InjectedKeplr } from "@keplr-wallet/provider";
import { KeplrMode } from "@keplr-wallet/types";
import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";

export class RNInjectedKeplr extends InjectedKeplr {
  static parseWebviewMessage(message: any): any {
    if (message && typeof message === "string") {
      try {
        return JSON.parse(message);
      } catch {
        // noop
      }
    }

    return message;
  }

  public async obiSignAndBroadcast(
    address: string,
    messages: EncodeObject[]
  ): Promise<DeliverTxResponse> {
    // @ts-expect-error
    return await this.requestMethod("obiSignAndBroadcast", [address, messages]);
  }

  constructor(version: string, mode: KeplrMode) {
    super(
      version,
      mode,
      {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener("message", fn),
        removeMessageListener: (fn: (e: any) => void) =>
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
