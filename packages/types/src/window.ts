import { Keplr, KeplrSignOptions } from "./wallet";
import { OfflineAminoSigner, OfflineDirectSigner } from "./cosmjs";
import { SecretUtils } from "./secretjs";

export interface Window {
  keplr?: Keplr;
  getOfflineSigner?: (
    chainId: string,
    signOptions?: KeplrSignOptions
  ) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino?: (
    chainId: string,
    signOptions?: KeplrSignOptions
  ) => OfflineAminoSigner;
  getOfflineSignerAuto?: (
    chainId: string,
    signOptions?: KeplrSignOptions
  ) => Promise<OfflineAminoSigner | OfflineDirectSigner>;
  getEnigmaUtils?: (chainId: string) => SecretUtils;
}
