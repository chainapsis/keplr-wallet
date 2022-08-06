import React from "react";
import { Image, StyleProp, View, ViewStyle } from "react-native";

export interface BackgroundProps {
  style: StyleProp<ViewStyle>;
}

export function Background({ style }: BackgroundProps) {
  return (
    <View
      style={[
        {
          justifyContent: "space-between",
          backgroundColor: "#1E1E1E",
          height: "100%",
        },
        style,
      ]}
    >
      <View style={{ flex: 1, position: "relative" }}>
        <Image
          source={require("../assets/backgroundblue.png")}
          style={{ alignSelf: "flex-end" }}
        />
        <Image
          source={require("../assets/backgroundpink.png")}
          style={{ position: "absolute", zIndex: -1, left: 0 }}
        />
      </View>
    </View>
  );
}
