import {
  InjectedKeplr,
  BrowserInjectedFetchWallet,
} from "@keplr-wallet/provider";

import manifest from "../../manifest.v2.json";
import { injectFetchWalletToWindow } from "@keplr-wallet/provider/src/fetchai/inject";

const keplr = new InjectedKeplr(manifest.version, "extension");

const fetchWallet = new BrowserInjectedFetchWallet(keplr, manifest.version);

injectFetchWalletToWindow(fetchWallet);
