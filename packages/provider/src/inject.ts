import {
  ChainInfo,
  Keplr,
  Keplr as IKeplr,
  KeplrIntereactionOptions,
  KeplrSignOptions,
  Key,
} from "@keplr-wallet/types";
import { Result } from "@keplr-wallet/router";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
  OfflineSigner,
} from "@cosmjs/launchpad";
import { cosmos } from "@keplr-wallet/cosmos";
import { SecretUtils } from "secretjs/types/enigmautils";

import { KeplrEnigmaUtils } from "./enigma";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";

import { JSONUint8Array } from "@keplr-wallet/router/build/json-uint8-array";
import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";

export interface ProxyRequest {
  type: "proxy-request";
  id: string;
  method: keyof Keplr;
  args: any[];
}

export interface ProxyRequestResponse {
  type: "proxy-request-response";
  id: string;
  result: Result | undefined;
}

/**
 * InjectedKeplr would be injected to the webpage.
 * In the webpage, it can't request any messages to the extension because it doesn't have any API related to the extension.
 * So, to request some methods of the extension, this will proxy the request to the content script that is injected to webpage on the extension level.
 * This will use `window.postMessage` to interact with the content script.
 */
export class InjectedKeplr implements IKeplr {
  static startProxy(keplr: IKeplr) {
    window.addEventListener("message", async (e: any) => {
      const message: ProxyRequest = e.data;
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

        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
          id: message.id,
          result: {
            return: JSONUint8Array.wrap(result),
          },
        };

        window.postMessage(proxyResponse, window.location.origin);
      } catch (e) {
        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
          id: message.id,
          result: {
            error: e.message || e.toString(),
          },
        };

        window.postMessage(proxyResponse, window.location.origin);
      }
    });
  }

  protected requestMethod(method: keyof IKeplr, args: any[]): Promise<any> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
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
        const proxyResponse: ProxyRequestResponse = e.data;

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

      window.postMessage(proxyMessage, window.location.origin);
    });
  }

  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: KeplrIntereactionOptions = {};

  constructor(public readonly version: string) {}

  async enable(chainIds: string | string[]): Promise<void> {
    await this.requestMethod("enable", [chainIds]);
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    await this.requestMethod("experimentalSuggestChain", [chainInfo]);
  }

  async getKey(chainId: string): Promise<Key> {
    return await this.requestMethod("getKey", [chainId]);
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    return await this.requestMethod("sendTx", [chainId, tx, mode]);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    return await this.requestMethod("signAmino", [
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: cosmos.tx.v1beta1.ISignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<DirectSignResponse> {
    const result = await this.requestMethod("signDirect", [
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);

    // IMPORTANT: Remember that the proto message is encoded by not the Uint8Json but the Message#toJson.
    //            So the result is not properly decoded as Uint8Array
    //            and even it has the long type by string without type conversion.
    //            So, we have to decode it by the proto message.
    const jsonSignDoc = result.signed as { [k: string]: any };
    const decodedSignDoc = cosmos.tx.v1beta1.SignDoc.fromObject(jsonSignDoc);
    return {
      signed: decodedSignDoc,
      signature: result.signature,
    };
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this);
  }

  async getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineSigner | OfflineDirectSigner> {
    const key = await this.getKey(chainId);
    if (key.isNanoLedger) {
      return new CosmJSOfflineSignerOnlyAmino(chainId, this);
    }
    return new CosmJSOfflineSigner(chainId, this);
  }

  async suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void> {
    return await this.requestMethod("suggestToken", [
      chainId,
      contractAddress,
      viewingKey,
    ]);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    return await this.requestMethod("getSecret20ViewingKey", [
      chainId,
      contractAddress,
    ]);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return await this.requestMethod("getEnigmaPubKey", [chainId]);
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requestMethod("getEnigmaTxEncryptionKey", [
      chainId,
      nonce,
    ]);
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await this.requestMethod("enigmaEncrypt", [
      chainId,
      contractCodeHash,
      msg,
    ]);
  }

  async enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requestMethod("enigmaDecrypt", [
      chainId,
      ciphertext,
      nonce,
    ]);
  }

  getEnigmaUtils(chainId: string): SecretUtils {
    if (this.enigmaUtils.has(chainId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.enigmaUtils.get(chainId)!;
    }

    const enigmaUtils = new KeplrEnigmaUtils(chainId, this);
    this.enigmaUtils.set(chainId, enigmaUtils);
    return enigmaUtils;
  }
}
