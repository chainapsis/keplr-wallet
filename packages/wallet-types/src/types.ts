import { Keplr } from "@keplr-wallet/types";

export interface FetchBrowserWallet {
  readonly version: string;
  readonly keplr: Keplr;
}
