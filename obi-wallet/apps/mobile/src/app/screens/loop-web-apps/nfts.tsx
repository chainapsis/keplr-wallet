import { useState } from "react";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConnectedWebView } from "../components/connected-web-view";

export function NFTs() {
  const safeArea = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "#17162C" }}>
      <ConnectedWebView
        url="https://nft-juno.loop.markets/myNft"
        onLoadEnd={() => setLoading(false)}
        style={{ flex: 1, marginTop: safeArea.top }}
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
}
