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
import { ExtensionKVStore } from "@keplr-wallet/common";
import { init } from "@keplr-wallet/background";
import scrypt from "scrypt-js";
import { Buffer } from "buffer/";

import {
  CommunityChainInfoRepo,
  EmbedChainInfos,
  PrivilegedOrigins,
} from "../config";

const router = new ExtensionRouter(ExtensionEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const { initFn, keyRingService } = init(
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
