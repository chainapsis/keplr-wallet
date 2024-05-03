import { MessageRequester } from "@keplr-wallet/router";
import { FetchBrowserWallet } from "@fetchai/wallet-types";
import { Keplr } from "@keplr-wallet/types";

export class ExtensionCoreFetchWallet implements FetchBrowserWallet {
  readonly keplr: Keplr;
  readonly version: string;

  constructor(keplr: Keplr, version: string, _requester: MessageRequester) {
    this.keplr = keplr;
    this.version = version;
  }
}
