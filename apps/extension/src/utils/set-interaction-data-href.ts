import { InteractionWaitingData } from "@keplr-wallet/background";
import { isRunningInSidePanel } from "./side-panel";

export const setInteractionDataHref = (
  interactionData: InteractionWaitingData
) => {
  const wasInteraction = window.location.href.includes("interaction=true");

  const queryString = `interaction=true&interactionInternal=${interactionData.isInternal}`;

  let uri = interactionData.uri;

  if (uri.startsWith("/")) {
    uri = uri.slice(1);
  }

  let url = browser.runtime.getURL(
    `/${isRunningInSidePanel() ? "sidePanel" : "popup"}.html#/` + uri
  );

  if (url.includes("?")) {
    url += "&" + queryString;
  } else {
    url += "?" + queryString;
  }

  if (wasInteraction) {
    window.location.replace(url);
  } else {
    window.location.href = url;
  }
};
