import { RNInjectedKeplr } from "./injected-provider";
import {
  BrowserInjectedFetchWallet,
  injectKeplrToWindow,
} from "@keplr-wallet/provider";

// TODO: Set the Keplr version properly
const keplr = new RNInjectedKeplr("0.10.10", "mobile-web");
const fetchWallet = new BrowserInjectedFetchWallet(keplr, "0.10.10");

injectKeplrToWindow(keplr, fetchWallet);
