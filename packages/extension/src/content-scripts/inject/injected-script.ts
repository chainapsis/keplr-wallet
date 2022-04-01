import {
  InjectedKeplr,
  BrowserInjectedFetchWallet,
} from "@keplr-wallet/provider";
import { init } from "./init";

import manifest from "../../manifest.json";

const keplr = new InjectedKeplr(manifest.version, "extension");
const fetchWallet = new BrowserInjectedFetchWallet(keplr, manifest.version);

init(
  keplr,
  fetchWallet,
  (chainId: string) => keplr.getOfflineSigner(chainId),
  (chainId: string) => keplr.getOfflineSignerOnlyAmino(chainId),
  (chainId: string) => keplr.getOfflineSignerAuto(chainId),
  (chainId: string) => keplr.getEnigmaUtils(chainId)
);
