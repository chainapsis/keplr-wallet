import { CosmosJSWalletProvider } from "./cosmosjs-wallet-provider";
import { Keplr } from "./common";
import { KeplrEnigmaUtils } from "./enigma-utils";

// Give a priority to production build.
if (process.env.NODE_ENV !== "production") {
  if (!window.keplr) {
    window.keplr = new Keplr();
  }

  if (!window.cosmosJSWalletProvider) {
    window.cosmosJSWalletProvider = new CosmosJSWalletProvider();
  }

  if (!window.getEnigmaUtils) {
    window.getEnigmaUtils = (chainId: string) => {
      return new KeplrEnigmaUtils(chainId);
    };
  }
} else {
  window.keplr = new Keplr();
  window.cosmosJSWalletProvider = new CosmosJSWalletProvider();
  window.getEnigmaUtils = (chainId: string) => {
    return new KeplrEnigmaUtils(chainId);
  };
}
