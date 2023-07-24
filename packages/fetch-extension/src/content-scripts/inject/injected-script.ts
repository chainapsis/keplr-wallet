import {
  InjectedKeplr,
  BrowserInjectedFetchWallet,
} from "@keplr-wallet/provider";
import { injectKeplrToWindow } from "@keplr-wallet/provider";

import manifest from "../../manifest.v2.json";

const keplr = new InjectedKeplr(manifest.version, "extension");
const fetchWallet = new BrowserInjectedFetchWallet(keplr, manifest.version);

injectKeplrToWindow(keplr, fetchWallet);
