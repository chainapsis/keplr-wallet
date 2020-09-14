import { WalletProvider } from "@chainapsis/cosmosjs/core/walletProvider";
import { Keplr } from "./content-scripts/inject/common";

declare global {
  interface Window {
    cosmosJSWalletProvider: WalletProvider | undefined;
    keplr: Keplr;
  }
}
