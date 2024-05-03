import { FetchBrowserWallet } from "@fetchai/wallet-types";
import { JSONUint8Array } from "@keplr-wallet/router";
import {
  createBrowserWindowProxy,
  createProxyResponse,
  ProxyRequest,
  ProxyResponse,
  toProxyRequest,
} from "./proxy";
import {
  AccountsApiMethod,
  AddressBookApiMethods,
  NetworksApiMethod,
  WalletMethod,
  WalletSigningMethod,
} from "./types";

async function dispatchRequest(
  _fetchApi: FetchBrowserWallet,
  request: ProxyRequest
): Promise<any> {
  const methodArray = request.method.split(".");

  const api = methodArray[0];
  if (request.method !== undefined) {
    if (api === "wallet") {
      if (methodArray[1] === "signing") {
        return await _fetchApi.wallet.signing[
          methodArray[methodArray.length - 1] as WalletSigningMethod
        ](
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...JSONUint8Array.unwrap(request.args)
        );
      } else if (methodArray[1] === "networks") {
        return await _fetchApi.wallet.networks[
          methodArray[methodArray.length - 1] as NetworksApiMethod
        ](
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...JSONUint8Array.unwrap(request.args)
        );
      } else if (methodArray[1] === "accounts") {
        return await _fetchApi.wallet.accounts[
          methodArray[methodArray.length - 1] as AccountsApiMethod
        ](
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...JSONUint8Array.unwrap(request.args)
        );
      } else if (methodArray[1] === "addressBook") {
        return await _fetchApi.wallet.addressBook[
          methodArray[methodArray.length - 1] as AddressBookApiMethods
        ](
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...JSONUint8Array.unwrap(request.args)
        );
      } else {
        const method = methodArray[methodArray.length - 1] as WalletMethod;
        return await _fetchApi.wallet[method](
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...JSONUint8Array.unwrap(request.args)
        );
      }
    }
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
