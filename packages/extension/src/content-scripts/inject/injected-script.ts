import {
  InjectedKeplr,
  BrowserInjectedFetchWallet,
} from "@keplr-wallet/provider";
import { injectKeplrToWindow } from "@keplr-wallet/provider";

import manifest from "../../manifest.json";

const keplr = new InjectedKeplr(manifest.version, "extension");
const fetchWallet = new BrowserInjectedFetchWallet(keplr, manifest.version);

injectKeplrToWindow(keplr, fetchWallet);
