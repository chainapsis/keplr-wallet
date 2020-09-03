import { WalletProvider } from "@chainapsis/cosmosjs/core/walletProvider";

declare global {
  interface Window {
    cosmosJSWalletProvider: WalletProvider | undefined;
  }
}
