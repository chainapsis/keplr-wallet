import { WalletProvider } from "@chainapsis/cosmosjs/core/walletProvider";
import { Keplr } from "./content-scripts/inject/common";
import { CosmJSOfflineSigner } from "./content-scripts/inject/cosmjs-offline-signer";
import { KeplrEnigmaUtils } from "./content-scripts/inject/enigma-utils";

declare global {
  interface Window {
    cosmosJSWalletProvider?: WalletProvider;
    getOfflineSigner?: (chainId: string) => CosmJSOfflineSigner;
    keplr?: Keplr;
    getEnigmaUtils?: (chainId: string) => KeplrEnigmaUtils | undefined;
  }
}
