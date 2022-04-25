import { JSONUint8Array } from "@keplr-wallet/router";
import {
  UmbralApi,
  UmbralEncryptionResult,
  UmbralKeyFragment,
} from "@fetchai/umbral-types";
import { Method } from "./types";
import {
  createBrowserWindowProxy,
  createProxyRequest,
  Proxy,
  toProxyResponse,
} from "./proxy";
import { FetchBrowserWallet } from "@fetchai/wallet-types";
import { Keplr } from "@keplr-wallet/types";

class BrowserInjectedUmbral implements UmbralApi {
  constructor(protected readonly proxy: Proxy) {}

  async getPublicKey(chainId: string): Promise<Uint8Array> {
    return this.requestViaProxy(Method.UMBRAL_V1_GET_PUBLIC_KEY, [chainId]);
  }

  async getSigningPublicKey(chainId: string): Promise<Uint8Array> {
    return this.requestViaProxy(Method.UMBRAL_V1_GET_SIGNING_KEY, [chainId]);
  }

  async encrypt(
    pubKey: Uint8Array,
    plainTextBytes: Uint8Array
  ): Promise<UmbralEncryptionResult> {
    return this.requestViaProxy(Method.UMBRAL_V1_ENCRYPT, [
      pubKey,
      plainTextBytes,
    ]);
  }

  async generateKeyFragments(
    chainId: string,
    receiverPublicKey: Uint8Array,
    threshold: number,
    shares: number
  ): Promise<UmbralKeyFragment[]> {
    return this.requestViaProxy(Method.UMBRAL_V1_GENERATE_KEY_FRAGMENTS, [
      chainId,
      receiverPublicKey,
      threshold,
      shares,
    ]);
  }

  async decrypt(
    chainId: string,
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    return this.requestViaProxy(Method.UMBRAL_V1_DECRYPT, [
      chainId,
      cipherTextBytes,
    ]);
  }

  async decryptReEncrypted(
    chainId: string,
    senderPublicKey: Uint8Array,
    capsule: Uint8Array,
    capsuleFragments: Uint8Array[],
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    return this.requestViaProxy(Method.UMBRAL_V1_DECRYPT_REENCRYPTED, [
      chainId,
      senderPublicKey,
      capsule,
      capsuleFragments,
      cipherTextBytes,
    ]);
  }

  async verifyCapsuleFragment(
    capsuleFragment: Uint8Array,
    capsule: Uint8Array,
    verifyingPublicKey: Uint8Array,
    senderPublicKey: Uint8Array,
    receiverPublicKey: Uint8Array
  ): Promise<boolean> {
    return this.requestViaProxy(Method.UMBRAL_V1_VERIFY_CAPSULE_FRAGMENT, [
      capsuleFragment,
      capsule,
      verifyingPublicKey,
      senderPublicKey,
      receiverPublicKey,
    ]);
  }

  protected async requestViaProxy(method: Method, args: any[]): Promise<any> {
    const proxyRequest = createProxyRequest(method, args);

    return new Promise((resolve, reject) => {
      const messageHandler = (e: any) => {
        const proxyResponse = toProxyResponse(e.data);
        if (proxyResponse === undefined) {
          return;
        }

        this.proxy.removeMessageHandler(messageHandler);

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

      this.proxy.addMessageHandler(messageHandler);
      this.proxy.sendMessage(proxyRequest);
    });
  }
}

export class BrowserInjectedFetchWallet implements FetchBrowserWallet {
  readonly keplr: Keplr;
  readonly umbral: UmbralApi;
  readonly version: string;

  constructor(keplr: Keplr, version: string) {
    this.keplr = keplr;
    this.version = version;
    this.umbral = new BrowserInjectedUmbral(createBrowserWindowProxy());
  }
}
