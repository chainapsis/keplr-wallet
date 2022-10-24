import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import { RefObject, useCallback, useEffect, useMemo } from "react";
import { RefreshControl, ScrollView } from "react-native";
import {
  WebView,
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";

import { useKeplr } from "../../../injected-provider";
import { bundle } from "../../../injected-provider/bundle";
import { RNInjectedKeplr } from "../../../injected-provider/injected-keplr";
import { useStore } from "../../../stores";

export interface ConnectedWebViewProps extends Omit<WebViewProps, "source"> {
  url: string;
  webViewRef: RefObject<WebView>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const ConnectedWebView = observer(
  ({
    url,
    webViewRef,
    loading,
    setLoading,
    ...props
  }: ConnectedWebViewProps) => {
    const keplr = useKeplr({ url });
    const code = bundle;

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
            webViewRef.current?.injectJavaScript(
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
    }, [eventEmitter, keplr, webViewRef]);

    const { permissionStore } = useStore();

    useEffect(() => {
      for (const data of permissionStore.waitingDatas) {
        console.log("trying to approve");
        permissionStore.approve(data.id);
        console.log("approved");
      }
    }, [permissionStore, permissionStore.waitingDatas]);

    if (!code) return null;

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#17162C" }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              webViewRef.current?.reload();
              setLoading(true);
            }}
            tintColor="rgba(246, 245, 255, 0.6)"
          />
        }
      >
        <WebView
          {...props}
          source={{ uri: url }}
          injectedJavaScriptBeforeContentLoaded={code}
          onMessage={onMessage}
          ref={webViewRef}
        />
      </ScrollView>
    );
  }
);
