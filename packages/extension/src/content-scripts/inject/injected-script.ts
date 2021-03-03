import { InjectedKeplr } from "@keplr-wallet/provider";
import { init } from "./init";

const keplr = new InjectedKeplr();

init(
  keplr,
  (chainId: string) => keplr.getOfflineSigner(chainId),
  (chainId: string) => keplr.getEnigmaUtils(chainId)
);
