import { RNInjectedKeplr } from "./injected-provider";
import { init } from "./init";

// TODO: Set the Keplr version properly
const keplr = new RNInjectedKeplr("0.10.10", "mobile-web");

init(
  keplr,
  (chainId: string) => keplr.getOfflineSigner(chainId),
  (chainId: string) => keplr.getEnigmaUtils(chainId)
);
