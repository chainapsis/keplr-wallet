import "./shim";
import { AppRegistry, Platform } from "react-native";
import RNFS from "react-native-fs";

import { App } from "./app";
import { initBackground } from "./background";
import "react-native-gesture-handler";
initBackground();

AppRegistry.registerComponent("Mobile", () => App);

if (Platform.OS === "ios") {
  RNFS.readFile(`${RNFS.MainBundlePath}/index.js`).then((res) =>
    console.log("I", res)
  );
}

if (Platform.OS === "android") {
  RNFS.readFileAssets("index.js").then((res) => console.log("A", res));
}
