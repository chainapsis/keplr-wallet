import React from "react";
import { View, Image } from "react-native";

export default function background() {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        marginRight: -40,
        backgroundColor: "#090817",
      }}
    >
      <Image
        source={require("../onboarding/assets/bgEllipseblue.png")}
        style={{ top: 200, left: 0, position: "absolute" }}
      />
      <Image
        source={require("../onboarding/assets/bgEllipsepurple.png")}
        style={{ position: "absolute", top: 0, right: 0 }}
      />
    </View>
  );
}
