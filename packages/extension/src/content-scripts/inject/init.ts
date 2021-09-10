import { Keplr } from "@keplr-wallet/types";
import { OfflineSigner } from "@cosmjs/launchpad";
import { SecretUtils } from "secretjs/types/enigmautils";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";

export function init(
  keplr: Keplr,
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner,
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineSigner,
  getOfflineSignerAuto: (
    chainId: string
  ) => Promise<OfflineSigner | OfflineDirectSigner>,
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
    if (!window.getOfflineSignerOnlyAmino) {
      window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
    }
    if (!window.getOfflineSignerAuto) {
      window.getOfflineSignerAuto = getOfflineSignerAuto;
    }
    if (!window.getEnigmaUtils) {
      window.getEnigmaUtils = getEnigmaUtils;
    }
  } else {
    window.keplr = keplr;
    window.getOfflineSigner = getOfflineSigner;
    window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
    window.getOfflineSignerAuto = getOfflineSignerAuto;
    window.getEnigmaUtils = getEnigmaUtils;
  }
}
