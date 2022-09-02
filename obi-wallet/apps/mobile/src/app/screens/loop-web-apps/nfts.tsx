import EventEmitter from "eventemitter3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import { useInjectedProvider, useKeplr } from "../../injected-provider";
import { RNInjectedKeplr } from "../../injected-provider/injected-keplr";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite/src/observer";

export const NFTs = observer(() => {
  const safeArea = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  const keplr = useKeplr({ url: "https://nft-juno.loop.markets/myNft" });
  const code = useInjectedProvider();

  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit("message", event.nativeEvent);
    },
    [eventEmitter]
  );

  const webviewRef = useRef<WebView>();

  // TODO: use store has to be called once so that the stores are actually initialized
  // Maybe do that in init background, too
  const { permissionStore } = useStore();

  console.log(permissionStore.waitingDatas)

  useEffect(() => {
    console.log(permissionStore.waitingDatas)
    for (const data of permissionStore.waitingDatas) {
      // TODO: show modal or something
      console.log('trying to approve')
      permissionStore.approve(data.id)
      console.log('approved')
    }
  }, [permissionStore, permissionStore.waitingDatas])

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

  return (
    <View style={{ flex: 1, backgroundColor: "#17162C" }}>
      {code ? (
        <WebView
          onLoadEnd={() => setLoading(false)}
          source={{ uri: "https://nft-juno.loop.markets/myNft" }}
          style={{ flex: 1, marginTop: safeArea.top }}
          injectedJavaScriptBeforeContentLoaded={code}
          onMessage={onMessage}
          ref={webviewRef}
        />
      ) : null}
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            zIndex: 2,
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#17162C",
          }}
        >
          <Image
            source={require("../onboarding/onboarding1/assets/loop.png")}
            style={{ marginBottom: 20 }}
          />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
            Loading NFTs..
          </Text>
        </View>
      )}
    </View>
  );
})
