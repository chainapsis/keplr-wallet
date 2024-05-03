import { FetchBrowserWallet } from "@fetchai/wallet-types";
import { Keplr } from "@keplr-wallet/types";

export class BrowserInjectedFetchWallet implements FetchBrowserWallet {
  readonly keplr: Keplr;
  readonly version: string;

  constructor(keplr: Keplr, version: string) {
    this.keplr = keplr;
    this.version = version;
  }
}
