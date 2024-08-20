import { Buffer } from "buffer/";

// 최초의 랜덤값이 필요하다.
const viewPostMessageId = (() => {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("hex");
})();

export const dispatchGlobalEventExceptSelf = (
  eventName: string,
  params?: any
) => {
  // 모든 extension의 view에게 메시지를 보낸다.
  for (const view of browser.extension.getViews()) {
    view.postMessage(
      {
        type: "__global_event_except_self",
        eventName,
        params,
        viewId: viewPostMessageId,
      },
      window.location.origin
    );
  }
};

export const addGlobalEventListener = (
  eventName: string,
  listener: (params?: any) => void
): (() => void) => {
  const callback = (event: MessageEvent<any>) => {
    if (
      !event.data ||
      event.data.type !== "__global_event_except_self" ||
      event.data.eventName !== eventName ||
      event.data.viewId === viewPostMessageId
    ) {
      return;
    }

    listener(event.data.params);
  };

  window.addEventListener("message", callback);

  return () => {
    window.removeEventListener("message", callback);
  };
};
