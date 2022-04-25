import { Method } from "./types";
import { UmbralApi } from "@fetchai/umbral-types";
import { FetchBrowserWallet } from "@fetchai/wallet-types";
import { JSONUint8Array } from "@keplr-wallet/router";
import {
  createBrowserWindowProxy,
  createProxyResponse,
  ProxyRequest,
  ProxyResponse,
  toProxyRequest,
} from "./proxy";

function lookupUmbralMethod(method: Method): keyof UmbralApi | undefined {
  switch (method) {
    case Method.UMBRAL_V1_GET_PUBLIC_KEY:
      return "getPublicKey";
    case Method.UMBRAL_V1_GET_SIGNING_KEY:
      return "getSigningPublicKey";
    case Method.UMBRAL_V1_ENCRYPT:
      return "encrypt";
    case Method.UMBRAL_V1_GENERATE_KEY_FRAGMENTS:
      return "generateKeyFragments";
    case Method.UMBRAL_V1_DECRYPT:
      return "decrypt";
    case Method.UMBRAL_V1_DECRYPT_REENCRYPTED:
      return "decryptReEncrypted";
    case Method.UMBRAL_V1_VERIFY_CAPSULE_FRAGMENT:
      return "verifyCapsuleFragment";
  }
}

async function dispatchRequest(
  fetchApi: FetchBrowserWallet,
  request: ProxyRequest
): Promise<any> {
  // if the method is an umbral method then execute it
  const umbralMethod = lookupUmbralMethod(request.method);
  if (umbralMethod !== undefined) {
    return await fetchApi.umbral[umbralMethod](
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ...JSONUint8Array.unwrap(request.args)
    );
  } else {
    throw new Error(`Unable to resolve request method ${request.method}`);
  }
}

async function proxyRequestHandler(
  fetchApi: FetchBrowserWallet,
  request: ProxyRequest
): Promise<ProxyResponse> {
  try {
    const result = await dispatchRequest(fetchApi, request);
    return createProxyResponse(request.id, {
      return: JSONUint8Array.wrap(result),
    });
  } catch (e) {
    return createProxyResponse(request.id, {
      error: e.m || e.toString(),
    });
  }
}

export async function startFetchWalletProxy(fetchApi: FetchBrowserWallet) {
  const proxy = createBrowserWindowProxy();

  const walletProxyHandler = async (e: any) => {
    const proxyRequest = toProxyRequest(e.data);
    if (proxyRequest === undefined) {
      return;
    }

    // dispatch the proxy request and then send back to the proxy the response
    proxy.sendMessage(await proxyRequestHandler(fetchApi, proxyRequest));
  };

  proxy.addMessageHandler(walletProxyHandler);
}
