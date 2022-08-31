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
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  window.keplr = keplr;
  // @ts-ignore
  window.getOfflineSigner = getOfflineSigner;
  // @ts-ignore
  window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
  // @ts-ignore
  window.getOfflineSignerAuto = getOfflineSignerAuto;
  // @ts-ignore
  window.getEnigmaUtils = getEnigmaUtils;
  /* eslint-enable @typescript-eslint/ban-ts-comment */
}
