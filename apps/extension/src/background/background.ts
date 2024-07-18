// Shim ------------
require("setimmediate");
// Shim ------------
if (typeof importScripts !== "undefined") {
  importScripts("browser-polyfill.js");
}

import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  ExtensionRouter,
  ExtensionGuards,
  ExtensionEnv,
  ContentScriptMessageRequester,
} from "@keplr-wallet/router-extension";
import { ExtensionKVStore, isServiceWorker } from "@keplr-wallet/common";
import { init } from "@keplr-wallet/background";
import scrypt from "scrypt-js";
import { Buffer } from "buffer/";
import { Bech32Address } from "@keplr-wallet/cosmos";

import {
  CommunityChainInfoRepo,
  EmbedChainInfos,
  PrivilegedOrigins,
} from "../config";

const router = new ExtensionRouter(ExtensionEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const { initFn, keyRingService, analyticsService } = init(
  router,
  (prefix: string) => new ExtensionKVStore(prefix),
  new ContentScriptMessageRequester(),
  EmbedChainInfos,
  PrivilegedOrigins,
  PrivilegedOrigins,
  PrivilegedOrigins,
  CommunityChainInfoRepo,
  {
    create: (params: {
      iconRelativeUrl?: string;
      title: string;
      message: string;
    }) => {
      browser.notifications.create({
        type: "basic",
        iconUrl: params.iconRelativeUrl
          ? browser.runtime.getURL(params.iconRelativeUrl)
          : undefined,
        title: params.title,
        message: params.message,
      });
    },
  },
  (callback: () => void) => {
    browser.idle.onStateChanged.addListener(
      (newState: browser.idle.IdleState) => {
        if ((newState as any) === "locked") {
          callback();
        }
      }
    );
  },
  "https://blocklist.keplr.app",
  {
    commonCrypto: {
      scrypt: async (
        text: string,
        params: { dklen: number; salt: string; n: number; r: number; p: number }
      ) => {
        return await scrypt.scrypt(
          Buffer.from(text),
          Buffer.from(params.salt, "hex"),
          params.n,
          params.r,
          params.p,
          params.dklen
        );
      },
    },
    getDisabledChainIdentifiers: async () => {
      const kvStore = new ExtensionKVStore("store_chain_config");
      const legacy = await kvStore.get<{ disabledChains: string[] }>(
        "extension_chainInfoInUIConfig"
      );
      if (!legacy) {
        return [];
      }
      return legacy.disabledChains ?? [];
    },
  },
  {
    platform: "extension",
    mobileOS: "nono",
  },
  false,
  async (chainsService, lastEmbedChainInfos) => {
    if (lastEmbedChainInfos.find((c) => c.chainId === "ixo-4")) {
      await chainsService.addSuggestedChainInfo({
        rpc: "https://rpc-ixo.keplr.app",
        rest: "https://lcd-ixo.keplr.app",
        chainId: "ixo-4",
        chainName: "ixo",
        stakeCurrency: {
          coinDenom: "IXO",
          coinMinimalDenom: "uixo",
          coinDecimals: 6,
        },
        walletUrl:
          process.env.NODE_ENV === "production"
            ? "https://wallet.keplr.app/chains/ixo"
            : "http://localhost:8080/chains/ixo",
        walletUrlForStaking:
          process.env.NODE_ENV === "production"
            ? "https://wallet.keplr.app/chains/ixo"
            : "http://localhost:8080/chains/ixo",
        bip44: {
          coinType: 118,
        },
        bech32Config: Bech32Address.defaultBech32Config("ixo"),
        currencies: [
          {
            coinDenom: "IXO",
            coinMinimalDenom: "uixo",
            coinDecimals: 6,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "IXO",
            coinMinimalDenom: "uixo",
            coinDecimals: 6,
          },
        ],
        features: ["ibc-transfer"],
      });
      await chainsService.addSuggestedChainInfo({
        rpc: "https://rpc-iov.keplr.app",
        rest: "https://lcd-iov.keplr.app",
        chainId: "iov-mainnet-ibc",
        chainName: "Starname",
        stakeCurrency: {
          coinDenom: "IOV",
          coinMinimalDenom: "uiov",
          coinDecimals: 6,
          coinGeckoId: "starname",
        },
        walletUrl:
          process.env.NODE_ENV === "production"
            ? "https://wallet.keplr.app/chains/starname"
            : "http://localhost:8080/chains/starname",
        walletUrlForStaking:
          process.env.NODE_ENV === "production"
            ? "https://wallet.keplr.app/chains/starname"
            : "http://localhost:8080/chains/starname",
        bip44: {
          coinType: 234,
        },
        bech32Config: Bech32Address.defaultBech32Config("star"),
        currencies: [
          {
            coinDenom: "IOV",
            coinMinimalDenom: "uiov",
            coinDecimals: 6,
            coinGeckoId: "starname",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "IOV",
            coinMinimalDenom: "uiov",
            coinDecimals: 6,
            coinGeckoId: "starname",
            gasPriceStep: {
              low: 1,
              average: 2,
              high: 3,
            },
          },
        ],
        features: ["ibc-transfer"],
      });
      await chainsService.addSuggestedChainInfo({
        rpc: "https://rpc-emoney.keplr.app",
        rest: "https://lcd-emoney.keplr.app",
        chainId: "emoney-3",
        chainName: "e-Money",
        stakeCurrency: {
          coinDenom: "NGM",
          coinMinimalDenom: "ungm",
          coinDecimals: 6,
          coinGeckoId: "e-money",
        },
        walletUrl:
          process.env.NODE_ENV === "production"
            ? "https://wallet.keplr.app/chains/e-money"
            : "http://localhost:8080/chains/e-money",
        walletUrlForStaking:
          process.env.NODE_ENV === "production"
            ? "https://wallet.keplr.app/chains/e-money"
            : "http://localhost:8080/chains/e-money",
        bip44: {
          coinType: 118,
        },
        bech32Config: Bech32Address.defaultBech32Config("emoney"),
        currencies: [
          {
            coinDenom: "NGM",
            coinMinimalDenom: "ungm",
            coinDecimals: 6,
            coinGeckoId: "e-money",
          },
          {
            coinDenom: "EEUR",
            coinMinimalDenom: "eeur",
            coinDecimals: 6,
            coinGeckoId: "e-money-eur",
          },
          {
            coinDenom: "EDKK",
            coinMinimalDenom: "edkk",
            coinDecimals: 6,
          },
          {
            coinDenom: "ESEK",
            coinMinimalDenom: "esek",
            coinDecimals: 6,
          },
          {
            coinDenom: "ENOK",
            coinMinimalDenom: "enok",
            coinDecimals: 6,
          },
          {
            coinDenom: "ECHF",
            coinMinimalDenom: "echf",
            coinDecimals: 6,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "NGM",
            coinMinimalDenom: "ungm",
            coinDecimals: 6,
            coinGeckoId: "e-money",
            gasPriceStep: {
              low: 1,
              average: 1,
              high: 1,
            },
          },
          {
            coinDenom: "EEUR",
            coinMinimalDenom: "eeur",
            coinDecimals: 6,
            coinGeckoId: "e-money-eur",
            gasPriceStep: {
              low: 1,
              average: 1,
              high: 1,
            },
          },
          {
            coinDenom: "ECHF",
            coinMinimalDenom: "echf",
            coinDecimals: 6,
            gasPriceStep: {
              low: 1,
              average: 1,
              high: 1,
            },
          },
          {
            coinDenom: "ESEK",
            coinMinimalDenom: "esek",
            coinDecimals: 6,
            gasPriceStep: {
              low: 1,
              average: 1,
              high: 1,
            },
          },
          {
            coinDenom: "ENOK",
            coinMinimalDenom: "enok",
            coinDecimals: 6,
            gasPriceStep: {
              low: 1,
              average: 1,
              high: 1,
            },
          },
          {
            coinDenom: "EDKK",
            coinMinimalDenom: "edkk",
            coinDecimals: 6,
            gasPriceStep: {
              low: 1,
              average: 1,
              high: 1,
            },
          },
        ],
        features: ["ibc-transfer"],
      });
    }

    if (lastEmbedChainInfos.find((c) => c.chainId === "tgrade-mainnet-1")) {
      await chainsService.addSuggestedChainInfo({
        rpc: "https://rpc-tgrade.keplr.app",
        rest: "https://lcd-tgrade.keplr.app",
        chainId: "tgrade-mainnet-1",
        chainName: "Tgrade",
        stakeCurrency: {
          coinDenom: "TGD",
          coinMinimalDenom: "utgd",
          coinDecimals: 6,
        },
        bip44: {
          coinType: 118,
        },
        bech32Config: Bech32Address.defaultBech32Config("tgrade"),
        currencies: [
          {
            coinDenom: "TGD",
            coinMinimalDenom: "utgd",
            coinDecimals: 6,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "TGD",
            coinMinimalDenom: "utgd",
            coinDecimals: 6,
            gasPriceStep: {
              low: 0.05,
              average: 0.05,
              high: 0.075,
            },
          },
        ],
        features: ["cosmwasm", "ibc-transfer", "ibc-go", "wasmd_0.24+"],
      });
    }
  },
  async (vaultService) => {
    if (isServiceWorker()) {
      await vaultService.unlockWithSessionPasswordIfPossible();
    }
  }
);

router.listen(BACKGROUND_PORT, initFn).then(() => {
  // Open register popup on installed
  const kvStore = new ExtensionKVStore("__background_open_register_once");
  // "register_opened" state ensures that the register popup is opened only once.
  kvStore.get("register_opened").then((v) => {
    if (!v) {
      kvStore.set("register_opened", true);

      // We should open popup only if the keyring is empty.
      // (If user already registered, and extension is updated, this case can be happened.)
      // With waiting router is initialized, it ensures that background service is initialized.
      if (keyRingService.keyRingStatus === "empty") {
        browser.tabs.create({
          url: "/register.html#",
        });
      }
    }
  });

  kvStore.get("installed_analytics").then((v) => {
    if (!v) {
      kvStore.set("installed_analytics", true);

      analyticsService.logEvent("installed", {
        version: browser.runtime.getManifest().version,
      });
    }
  });
});

browser.alarms.create("keep-alive-alarm", {
  periodInMinutes: 0.25,
});

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keep-alive-alarm") {
    // noop
    // To make background persistent even if it is service worker, invoke noop alarm periodically.
    // https://developer.chrome.com/blog/longer-esw-lifetimes/
  }
});
