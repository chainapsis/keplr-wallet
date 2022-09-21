import { Keplr } from "@keplr-wallet/types";
import { SecretUtils } from "secretjs/types/enigmautils";
import {
  EncodeObject,
  OfflineDirectSigner,
  OfflineSigner,
} from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";

export function init(
  keplr: Keplr,
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner,
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineSigner,
  getOfflineSignerAuto: (
    chainId: string
  ) => Promise<OfflineSigner | OfflineDirectSigner>,
  getEnigmaUtils: (chainId: string) => SecretUtils,
  obiSignAndBroadcast: (
    address: string,
    messages: EncodeObject[]
  ) => Promise<DeliverTxResponse>
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
  // @ts-ignore
  window.obiSignAndBroadcast = obiSignAndBroadcast;
  /* eslint-enable @typescript-eslint/ban-ts-comment */
}
