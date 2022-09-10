import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  WebView,
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";

import { useInjectedProvider, useKeplr } from "../../../injected-provider";
import { RNInjectedKeplr } from "../../../injected-provider/injected-keplr";
import { useStore } from "../../../stores";

export interface ConnectedWebViewProps extends Omit<WebViewProps, "source"> {
  url: string;
}

export const ConnectedWebView = observer(
  ({ url, ...props }: ConnectedWebViewProps) => {
    const keplr = useKeplr({ url });
    const code = useInjectedProvider();

    const eventEmitter = useMemo(() => new EventEmitter(), []);
    const onMessage = useCallback(
      (event: WebViewMessageEvent) => {
        eventEmitter.emit("message", event.nativeEvent);
      },
      [eventEmitter]
    );
    useEffect(() => {
      RNInjectedKeplr.startProxy(
        keplr,
        {
          addMessageListener: (fn) => {
            eventEmitter.addListener("message", fn);
          },
          postMessage: (message) => {
            webviewRef.current?.injectJavaScript(
              `
                window.postMessage(${JSON.stringify(
                  message
                )}, window.location.origin);
                true; // note: this is required, or you'll sometimes get silent failures
              `
            );
          },
        },
        RNInjectedKeplr.parseWebviewMessage
      );
    }, [eventEmitter, keplr]);

    const webviewRef = useRef<WebView>(null);

    const { permissionStore } = useStore();

    useEffect(() => {
      for (const data of permissionStore.waitingDatas) {
        // TODO: show modal or something
        console.log("trying to approve");
        permissionStore.approve(data.id);
        console.log("approved");
      }
    }, [permissionStore, permissionStore.waitingDatas]);

    if (!code) return null;

    return (
      <WebView
        {...props}
        source={{ uri: url }}
        injectedJavaScriptBeforeContentLoaded={code}
        onMessage={onMessage}
        ref={webviewRef}
      />
    );
  }
);
