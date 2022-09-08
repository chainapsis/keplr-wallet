import "./shim";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";

import { App } from "./app";
import { initBackground } from "./background";

initBackground();

AppRegistry.registerComponent("Mobile", () => App);
