import { Keplr } from "./wallet";
import { OfflineSigner } from "@cosmjs/launchpad";
import { SecretUtils } from "secretjs/types/enigmautils";

export interface Window {
  keplr?: Keplr;
  getOfflineSigner?: (chainId: string) => OfflineSigner;
  getEnigmaUtils?: (chainId: string) => SecretUtils;
}
