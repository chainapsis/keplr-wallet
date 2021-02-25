import { Env, FnRequestInteraction, MessageSender } from "../types";
import { openPopupWindow as openPopupWindowInner } from "@keplr/popup";
import { APP_PORT } from "../constant";
import { InExtensionMessageRequester } from "../requester";
import PQueue from "p-queue";

const openPopupQueue = new PQueue({
  concurrency: 1,
});

// To handle the opening popup more easily,
// just open the popup one by one.
async function openPopupWindow(
  url: string,
  channel: string = "default"
): Promise<number> {
  return await openPopupQueue.add(() => openPopupWindowInner(url, channel));
}

export class ExtensionEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = ExtensionEnv.checkIsInternalMessage(sender);

    // Add additional query string for letting the extension know it is for interaction.
    const queryString = `interaction=true&interactionInternal=${isInternalMsg}`;

    const openAndSendMsg: FnRequestInteraction = async (url, msg, options) => {
      if (url.startsWith("/")) {
        url = url.slice(1);
      }

      url = browser.runtime.getURL("/popup.html#/" + url);

      if (url.includes("?")) {
        url += "&" + queryString;
      } else {
        url += "?" + queryString;
      }

      const windowId = await openPopupWindow(url, options?.channel);
      const window = await browser.windows.get(windowId, {
        populate: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tabId = window.tabs![0].id!;

      // Wait until that tab is loaded
      await (async () => {
        const tab = await browser.tabs.get(tabId);
        if (tab.status === "complete") {
          return;
        }

        return new Promise<void>((resolve) => {
          browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
            if (tabId === _tabId && changeInfo.status === "complete") {
              resolve();
            }
          });
        });
      })();

      return await InExtensionMessageRequester.sendMessageToTab(
        tabId,
        APP_PORT,
        msg
      );
    };

    if (!isInternalMsg) {
      // If msg is from external (probably from webpage), it opens the popup for extension and send the msg back to the tab opened.
      return {
        isInternalMsg,
        requestInteraction: openAndSendMsg,
      };
    } else {
      // If msg is from the extension itself, it can send the msg back to the extension itself.
      // In this case, this expects that there is only one extension popup have been opened.
      const requestInteraction: FnRequestInteraction = async (
        url,
        msg,
        options
      ) => {
        if (options?.forceOpenWindow) {
          return await openAndSendMsg(url, msg, options);
        }

        if (url.startsWith("/")) {
          url = url.slice(1);
        }

        url = browser.runtime.getURL("/popup.html#/" + url);

        if (url.includes("?")) {
          url += "&" + queryString;
        } else {
          url += "?" + queryString;
        }

        const backgroundPage = await browser.runtime.getBackgroundPage();
        const windows = browser.extension.getViews().filter((window) => {
          return window.location.href !== backgroundPage.location.href;
        });
        const prefer = windows.find((window) => {
          return window.location.href === sender.url;
        });
        (prefer ?? windows[0]).location.href = url;

        return await new InExtensionMessageRequester().sendMessage(
          APP_PORT,
          msg
        );
      };

      return {
        isInternalMsg,
        requestInteraction,
      };
    }
  };

  protected static readonly checkIsInternalMessage = (
    sender: MessageSender
  ): boolean => {
    if (!sender.url) {
      return false;
    }
    const url = new URL(sender.url);
    if (!url.origin || url.origin === "null") {
      throw new Error("Invalid sender url");
    }

    const browserURL = new URL(browser.runtime.getURL("/"));
    if (!browserURL.origin || browserURL.origin === "null") {
      throw new Error("Invalid browser url");
    }

    if (url.origin !== browserURL.origin) {
      return false;
    }

    return sender.id === browser.runtime.id;
  };
}
