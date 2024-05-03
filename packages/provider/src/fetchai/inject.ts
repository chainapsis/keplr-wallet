import { createBrowserWindowProxy } from "./proxy";
import { FetchBrowserWallet, WalletApi } from "@fetchai/wallet-types";
import { Keplr } from "@keplr-wallet/types";
import { InjectedFetchWalletApi } from "./wallet-api";
import { defineUnwritablePropertyIfPossible } from "../inject";

export class BrowserInjectedFetchWallet implements FetchBrowserWallet {
  readonly keplr: Keplr;
  readonly version: string;
  readonly wallet: WalletApi;

  constructor(keplr: Keplr, version: string) {
    this.keplr = keplr;
    this.version = version;

    const proxy = createBrowserWindowProxy();
    this.wallet = new InjectedFetchWalletApi(proxy);
  }
}

export function injectFetchWalletToWindow(
  fetchBrowserWallet: FetchBrowserWallet
): void {
  defineUnwritablePropertyIfPossible(
    window,
    "fetchBrowserWallet",
    fetchBrowserWallet
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSigner",
    fetchBrowserWallet.wallet.signing.getOfflineSigner
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineAminoSigner",
    fetchBrowserWallet.wallet.signing.getOfflineAminoSigner
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineDirectSigner",
    fetchBrowserWallet.wallet.signing.getOfflineDirectSigner
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSigner",
    fetchBrowserWallet.wallet.signing.getOfflineSigner
  );
}
