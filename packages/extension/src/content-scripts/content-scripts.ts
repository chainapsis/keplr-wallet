import { WEBPAGE_PORT, Message, BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionRouter,
  InExtensionMessageRequester,
} from "@keplr-wallet/router-extension";
import { Keplr, InjectedKeplr } from "@keplr-wallet/provider";
import { initEvents } from "./events";

import manifest from "../manifest.json";

InjectedKeplr.startProxy(
  new Keplr(manifest.version, "core", new InExtensionMessageRequester())
);

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

export class CheckURLIsPhishingMsg extends Message<boolean> {
  public static type() {
    return "check-url-is-phishing";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // Will be checked in background process
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "phishing-list";
  }

  type(): string {
    return CheckURLIsPhishingMsg.type();
  }
}

new InExtensionMessageRequester()
  .sendMessage(BACKGROUND_PORT, new CheckURLIsPhishingMsg())
  .then((r) => {
    if (r) {
      alert(
        "[Scam Alert] This domain is listed on the Keplr domain warning list, meaning this is a phishing site. We recommend you to close this website right away."
      );
    }
  })
  .catch((e) => {
    console.log("Failed to check domain's reliability", e);
  });
