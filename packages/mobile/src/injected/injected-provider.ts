import {
  InjectedKeplr,
  ProxyRequest,
  ProxyRequestResponse,
} from "@keplr-wallet/provider";
import { Keplr as IKeplr } from "@keplr-wallet/types";
import { JSONUint8Array } from "@keplr-wallet/router/build/json-uint8-array";

export class RNInjectedKeplr extends InjectedKeplr {
  /**
     onMessageHandler returns the handler for onMessage prop.
     This returns the `ProxyRequestResponse` to be expected to be delivered to the webview side (by injecting the window.postMessage script).
     */
  static onMessageHandler = (keplr: IKeplr) => async (
    data: string
  ): Promise<ProxyRequestResponse | undefined> => {
    let message: ProxyRequest;
    try {
      message = JSON.parse(data);
    } catch {
      return;
    }
    if (!message || message.type !== "proxy-request") {
      return;
    }

    try {
      if (!message.id) {
        throw new Error("Empty id");
      }

      if (message.method === "version") {
        throw new Error("Version is not function");
      }

      if (message.method === "defaultOptions") {
        throw new Error("DefaultOptions is not function");
      }

      if (
        !keplr[message.method] ||
        typeof keplr[message.method] !== "function"
      ) {
        throw new Error(`Invalid method: ${message.method}`);
      }

      if (message.method === "getOfflineSigner") {
        throw new Error("GetOfflineSigner method can't be proxy request");
      }

      if (message.method === "getOfflineSignerOnlyAmino") {
        throw new Error(
          "GetOfflineSignerOnlyAmino method can't be proxy request"
        );
      }

      if (message.method === "getOfflineSignerAuto") {
        throw new Error("GetOfflineSignerAuto method can't be proxy request");
      }

      if (message.method === "getEnigmaUtils") {
        throw new Error("GetEnigmaUtils method can't be proxy request");
      }

      const result = await keplr[message.method](
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...JSONUint8Array.unwrap(message.args)
      );

      return {
        type: "proxy-request-response",
        id: message.id,
        result: {
          return: JSONUint8Array.wrap(result),
        },
      };
    } catch (e) {
      return {
        type: "proxy-request-response",
        id: message.id,
        result: {
          error: e.message || e.toString(),
        },
      };
    }
  };

  protected requestMethod(method: keyof IKeplr, args: any[]): Promise<any> {
    const bytes = new Uint8Array(8);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const id: string = (Array.from(crypto.getRandomValues(bytes)) as number[])
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        let proxyResponse: ProxyRequestResponse;
        try {
          proxyResponse = JSON.parse(e.data);
        } catch {
          return;
        }

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        window.removeEventListener("message", receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result.return);
      };

      window.addEventListener("message", receiveResponse);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify(proxyMessage));
    });
  }
}
