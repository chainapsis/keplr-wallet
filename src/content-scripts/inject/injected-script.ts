import { InjectedCosmosJSWalletProvider } from "./cosmosjs-provider";
import { InjectedCosmJSWalletProvider } from "./cosmjs-provder";
import { Keplr } from "./common";

// Give a priority to production build.
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  if (!window.keplr) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    window.keplr = Keplr;
  }

  if (!window.cosmosJSWalletProvider) {
    window.cosmosJSWalletProvider = new InjectedCosmosJSWalletProvider();
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  if (!window.getCosmJSWalletProvider) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    window.getCosmJSWalletProvider = (chainId: string) => {
      return new InjectedCosmJSWalletProvider(chainId);
    };
  }
} else {
  window.cosmosJSWalletProvider = new InjectedCosmosJSWalletProvider();
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  window.getCosmJSWalletProvider = (chainId: string) => {
    return new InjectedCosmJSWalletProvider(chainId);
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  window.keplr = Keplr;
}
