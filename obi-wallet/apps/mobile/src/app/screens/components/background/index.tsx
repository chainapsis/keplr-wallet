import { Image, View } from "react-native";

export function Background() {
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
        source={require("./assets/background-blue.png")}
        style={{ top: 200, left: 0, position: "absolute" }}
      />
      <Image
        source={require("./assets/background-purple.png")}
        style={{ position: "absolute", top: 0, right: 0 }}
      />
    </View>
  );
}
