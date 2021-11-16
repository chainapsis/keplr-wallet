import { RNInjectedKeplr } from "./injected-provider";
import { init } from "./init";

// TODO: Set the Keplr version properly
const keplr = new RNInjectedKeplr("0.0.1", "mobile-web");

init(
  keplr,
  (chainId: string) => keplr.getOfflineSigner(chainId),
  (chainId: string) => keplr.getEnigmaUtils(chainId)
);
