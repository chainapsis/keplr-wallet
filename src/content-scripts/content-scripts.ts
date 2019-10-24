import { proxyMessage } from "../common/message";

proxyMessage();

const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = chrome.runtime.getURL("injectedScript.bundle.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
