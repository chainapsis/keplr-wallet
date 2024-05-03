import { FetchBrowserWallet } from "@fetchai/wallet-types";
import { JSONUint8Array } from "@keplr-wallet/router";
import {
  createBrowserWindowProxy,
  createProxyResponse,
  ProxyRequest,
  ProxyResponse,
  toProxyRequest,
} from "./proxy";

async function dispatchRequest(
  _fetchApi: FetchBrowserWallet,
  request: ProxyRequest
): Promise<any> {
  throw new Error(`Unable to resolve request method ${request.method}`);
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
  } catch (e: any) {
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
