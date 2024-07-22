import { InteractionWaitingData } from "@keplr-wallet/background";
import { isRunningInSidePanel } from "./side-panel";

export const setInteractionDataHref = (
  interactionData: InteractionWaitingData
) => {
  if (interactionData.uri === "/unlock") {
    // /unlock의 경우는 따로 route에서 unlock이 필요한 경우
    // 강제로 unlock page를 보여주도록 처리한다.
    return;
  }

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
