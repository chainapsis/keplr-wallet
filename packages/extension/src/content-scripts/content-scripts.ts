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

export class CheckBadTwitterIdMsg extends Message<boolean> {
  public static type() {
    return "check-bad-twitter-id";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "phishing-list";
  }

  type(): string {
    return CheckBadTwitterIdMsg.type();
  }
}

const url = new URL(window.location.href);
// If host is localhost, no need to check validity of domain.
if (url.hostname !== "localhost") {
  new InExtensionMessageRequester()
    .sendMessage(BACKGROUND_PORT, new CheckURLIsPhishingMsg())
    .then((r) => {
      if (r) {
        const origin = window.location.href;
        window.location.replace(
          browser.runtime.getURL(`/blocklist.html?origin=${origin}`)
        );
      }
    })
    .catch((e) => {
      console.log("Failed to check domain's reliability", e);
    });
}

if (url.hostname === "twitter.com") {
  if (typeof MutationObserver !== "undefined") {
    let previousUrl: string = "";
    const observer = new MutationObserver(() => {
      if (window.location.href !== previousUrl) {
        previousUrl = window.location.href;

        const url = new URL(window.location.href);
        const paths = url.pathname
          .split("/")
          .map((path) => path.trim())
          .filter((path) => path.length > 0);

        if (paths.length > 0) {
          let id = paths[0];
          if (id.startsWith("@")) {
            id = id.slice(1);
          }

          new InExtensionMessageRequester()
            .sendMessage(BACKGROUND_PORT, new CheckBadTwitterIdMsg(id))
            .then((r) => {
              if (r) {
                alert(`Phishing Alert
@${id} is detected as Keplr’s phishing account.
This twitter account has malicious intent so recommend you not to interact with it.`);
              }
            })
            .catch((e) => {
              console.log("Failed to check twitter id's reliability", e);
            });
        }
      }
    });
    observer.observe(document, { subtree: true, childList: true });

    window.addEventListener("beforeunload", () => {
      observer.disconnect();
    });
  }
}
