import { listenAndProxyMessages } from "../common/message";
import { listenEvents } from "./events";

listenEvents();

listenAndProxyMessages();

const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = browser.runtime.getURL("injectedScript.bundle.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
