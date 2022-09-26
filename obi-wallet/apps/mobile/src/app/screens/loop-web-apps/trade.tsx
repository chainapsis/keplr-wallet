import { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { ConnectedWebView } from "../components/connected-web-view";

export function Trade() {
  const safeArea = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

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
        />
      }
    >
      <ConnectedWebView
        url="https://juno.loop.markets/webapp/swap#Swap"
        onLoadEnd={() => setLoading(false)}
        style={{ flex: 1, marginTop: safeArea.top }}
        webViewRef={webViewRef}
      />
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
            source={require("../../../assets/loop.png")}
            style={{ marginBottom: 20 }}
          />
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
            <FormattedMessage
              id="menu.trade.loading"
              defaultMessage="Loading..."
            />
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
