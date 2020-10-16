import { WalletProvider } from "@chainapsis/cosmosjs/core/walletProvider";
import { Keplr } from "./content-scripts/inject/common";
import { CosmJSOfflineSigner } from "./content-scripts/inject/cosmjs-offline-signer";

declare global {
  interface Window {
    cosmosJSWalletProvider?: WalletProvider;
    getOfflineSigner?: (chainId: string) => CosmJSOfflineSigner;
    keplr?: Keplr;
  }
}
