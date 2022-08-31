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
      <View
        style={{
          flex: 1,
          position: "absolute",
          opacity: 0.3,
          backgroundColor: "#000",
          width: "200%",
          height: "200%",
          zIndex: 0,
          overflow: "visible",
        }}
      ></View>

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