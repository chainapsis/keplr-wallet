import { WalletProvider } from "@chainapsis/cosmosjs/core/walletProvider";
import { Keplr } from "./content-scripts/inject/common";
import { KeplrEnigmaUtils } from "./content-scripts/inject/enigma-utils";

declare global {
  interface Window {
    cosmosJSWalletProvider: WalletProvider | undefined;
    getEnigmaUtils: (chainId: string) => KeplrEnigmaUtils | undefined;
    keplr: Keplr;
  }
}
