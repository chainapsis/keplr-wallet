import { Text } from "@obi-wallet/common";
import { ActivityIndicator, View } from "react-native";

export function Loader({ loadingText }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#fff" />

      {loadingText ? (
        <Text
          style={{
            color: "#fff",
            paddingTop: 15,
          }}
        >
          {loadingText}
        </Text>
      ) : null}
    </View>
  );
}
