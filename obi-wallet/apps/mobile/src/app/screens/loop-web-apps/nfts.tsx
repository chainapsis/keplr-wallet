import { useNavigationState } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { ConnectedWebView } from "../components/connected-web-view";

export function NFTs() {
  const safeArea = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const intl = useIntl();

  const isActive = useNavigationState(
    (state) => state.routeNames[state.index] === "NFTs"
  );

  useEffect(() => {
    if (isActive) {
      Alert.alert(
        intl.formatMessage({
          id: "general.comingsoon",
          defaultMessage: "Coming Soon",
        }),
        intl.formatMessage({
          id: "nfts.coming soon",
          defaultMessage: "NFT webapp is coming soon.",
        })
      );
    }
  }, [intl, isActive]);

  return (
    <View style={{ flex: 1, backgroundColor: "#17162C" }}>
      <ConnectedWebView
        url="https://nft-juno.loop.markets/webapp/myNft"
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
              id="menu.loadingnfts"
              defaultMessage="Loading NFTs.."
            />
          </Text>
        </View>
      )}
    </View>
  );
}
