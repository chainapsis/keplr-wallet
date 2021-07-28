import { InjectedKeplr } from "@keplr-wallet/provider";
import { init } from "./init";

import manifest from "../../manifest.json";

const keplr = new InjectedKeplr(manifest.version);

init(
  keplr,
  (chainId: string) => keplr.getOfflineSigner(chainId),
  (chainId: string) => keplr.getOfflineSignerOnlyAmino(chainId),
  (chainId: string) => keplr.getOfflineSignerAuto(chainId),
  (chainId: string) => keplr.getEnigmaUtils(chainId)
);
