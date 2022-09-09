import { Text } from "@obi-wallet/common";
import { ActivityIndicator, View } from "react-native";

export function Loader({ loadingText, styleBackdrop, styleBox }) {
  return (
    <View style={styleBackdrop}>
      <View style={styleBox}>
        <ActivityIndicator size="large" color="#8877EA" />

        {loadingText ? (
          <Text
            style={{
              color: "#F6F5FF",
              paddingTop: 15,
              fontSize: 11,
              letterSpacing: 0.25,
            }}
          >
            {loadingText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
