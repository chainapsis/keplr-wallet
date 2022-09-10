import { Text } from "@obi-wallet/common";
import { ActivityIndicator, View } from "react-native";

interface LoaderProps {
  loadingText?: string;
  style?: any;
}

export function Loader({ loadingText, style }: LoaderProps) {
  return (
    <View style={style}>
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
  );
}
