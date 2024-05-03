import { OfflineAminoSigner, OfflineDirectSigner } from "@keplr-wallet/types";
import { FetchBrowserWallet } from "./types";

export interface Window {
  fetchBrowserWallet?: FetchBrowserWallet;
  getOfflineSigner?: (
    chainId: string
  ) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino?: (chainId: string) => OfflineAminoSigner;
  getOfflineSignerAuto?: (
    chainId: string
  ) => Promise<OfflineAminoSigner | OfflineDirectSigner>;
}
