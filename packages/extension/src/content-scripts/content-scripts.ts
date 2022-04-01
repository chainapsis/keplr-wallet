import { WEBPAGE_PORT } from "@keplr-wallet/router";
import {
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionRouter,
  InExtensionMessageRequester,
} from "@keplr-wallet/router-extension";
import {
  Keplr,
  InjectedKeplr,
  ExtensionCoreFetchWallet,
  startFetchWalletProxy,
} from "@keplr-wallet/provider";
import { initEvents } from "./events";

import manifest from "../manifest.json";

const messageRequester = new InExtensionMessageRequester();
const coreKeplr = new Keplr(manifest.version, "core", messageRequester);
const coreFetchWallet = new ExtensionCoreFetchWallet(
  coreKeplr,
  manifest.version,
  messageRequester
);

InjectedKeplr.startProxy(coreKeplr);
startFetchWalletProxy(coreFetchWallet);

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.addGuard(ContentScriptGuards.checkMessageIsInternal);
initEvents(router);
router.listen(WEBPAGE_PORT);

const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = browser.runtime.getURL("injectedScript.bundle.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
