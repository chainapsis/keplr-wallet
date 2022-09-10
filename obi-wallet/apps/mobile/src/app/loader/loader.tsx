import { Text } from "@obi-wallet/common";
import { ActivityIndicator, View } from "react-native";

interface LoaderProps {
  loadingText?: string;
}

export function Loader({ loadingText }: LoaderProps) {
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
