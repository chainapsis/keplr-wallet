import { CosmosJSWalletProvider } from "./cosmosjs-wallet-provider";
import { Keplr } from "./common";

// Give a priority to production build.
if (process.env.NODE_ENV !== "production") {
  if (!window.keplr) {
    window.keplr = new Keplr();
  }

  if (!window.cosmosJSWalletProvider) {
    window.cosmosJSWalletProvider = new CosmosJSWalletProvider();
  }
} else {
  window.keplr = new Keplr();
  window.cosmosJSWalletProvider = new CosmosJSWalletProvider();
}
