import { listenAndProxyMessages } from "../common/message";

listenAndProxyMessages();

const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

if (typeof chrome === "undefined") {
  scriptElement.src = browser.runtime.getURL("injectedScript.bundle.js");
} else {
  scriptElement.src = chrome.runtime.getURL("injectedScript.bundle.js");
}
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
