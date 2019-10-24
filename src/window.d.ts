import { WalletProvider } from "@everett-protocol/cosmosjs/core/walletProvider";

declare global {
  interface Window {
    cosmosJSWalletProvider: WalletProvider | undefined;
  }
}
