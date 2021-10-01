import { RNInjectedKeplr } from "./injected-provider";
import { init } from "./init";

// TODO: Set the Keplr version properly
const keplr = new RNInjectedKeplr("0.0.1");

init(
  keplr,
  (chainId: string) => keplr.getOfflineSigner(chainId),
  // TODO: Below line makes error because the secretjs version unmatched.
  //       But, the production on the Keplr already uses the latest version of secretjs.
  //       Match the version before production.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (chainId: string) => keplr.getEnigmaUtils(chainId)
);
