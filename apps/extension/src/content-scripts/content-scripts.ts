import { WEBPAGE_PORT, Message, BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionRouter,
  InExtensionMessageRequester,
} from "@keplr-wallet/router-extension";
import { Keplr, InjectedKeplr } from "@keplr-wallet/provider";
import { initEvents } from "./events";

import manifest from "../manifest.v2.json";

(window as any).__keplr_content_script = true;

InjectedKeplr.startProxy(
  new Keplr(manifest.version, "core", new InExtensionMessageRequester()),
  process.env.KEPLR_EXT_PROVIDER_META_ID
    ? process.env.KEPLR_EXT_PROVIDER_META_ID
    : undefined
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

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "phishing-list";
  }

  type(): string {
    return CheckURLIsPhishingMsg.type();
  }
}

class URLTempAllowMsg extends Message<void> {
  public static type() {
    return "url-temp-allow";
  }

  constructor(public readonly url: string) {
    super();
  }

  validateBasic(): void {
    // validate url
    new URL(this.url);
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "phishing-list";
  }

  type(): string {
    return URLTempAllowMsg.type();
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

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "phishing-list";
  }

  type(): string {
    return CheckBadTwitterIdMsg.type();
  }
}

const blocklistURL = "https://blocklist.keplr.app";

const url = new URL(window.location.href);
// If host is localhost, no need to check validity of domain.
if (url.hostname !== "localhost") {
  new InExtensionMessageRequester()
    .sendMessage(BACKGROUND_PORT, new CheckURLIsPhishingMsg())
    .then((r) => {
      if (r) {
        const origin = window.location.href;
        window.location.replace(
          blocklistURL + `?origin=${encodeURIComponent(origin)}`
        );
      }
    })
    .catch((e) => {
      console.log("Failed to check domain's reliability", e);
    });
}

try {
  const _blocklistURL = new URL(blocklistURL);
  if (url.origin === _blocklistURL.origin) {
    addEventListener("message", (e) => {
      try {
        if (e.origin !== _blocklistURL.origin) {
          return;
        }
        if (e.data.type !== "allow-temp-blocklist-url") {
          return;
        }
        const origin = e.data.origin;
        const expected =
          new URLSearchParams(window.location.search).get("origin") || "";
        if (new URL(origin).href !== new URL(expected).href) {
          return;
        }

        new InExtensionMessageRequester()
          .sendMessage(
            BACKGROUND_PORT,
            new URLTempAllowMsg(new URL(origin).href)
          )
          .then(() => {
            window.postMessage(
              {
                type: "blocklist-url-temp-allowed",
                origin,
              },
              window.location.origin
            );
          })
          .catch((e) => {
            console.log(e);
            // ignore error
          });
      } catch (e) {
        console.log(e);
        // ignore error
      }
    });
  }
} catch (e) {
  // noop
  console.log(e);
}

if (url.hostname === "twitter.com" || url.hostname === "x.com") {
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
