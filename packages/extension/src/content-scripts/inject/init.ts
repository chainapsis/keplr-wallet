import { Keplr } from "@keplr-wallet/provider";
import { OfflineSigner } from "@cosmjs/launchpad";
import { SecretUtils } from "secretjs/types/enigmautils";

export function init(
  keplr: Keplr,
  getOfflineSigner: (chainId: string) => OfflineSigner,
  getEnigmaUtils: (chainId: string) => SecretUtils
) {
  // Give a priority to production build.
  if (process.env.NODE_ENV !== "production") {
    if (!window.keplr) {
      window.keplr = keplr;
    }

    if (!window.getOfflineSigner) {
      window.getOfflineSigner = getOfflineSigner;
    }
    if (!window.getEnigmaUtils) {
      window.getEnigmaUtils = getEnigmaUtils;
    }
  } else {
    window.keplr = keplr;
    window.getOfflineSigner = getOfflineSigner;
    window.getEnigmaUtils = getEnigmaUtils;
  }
}
