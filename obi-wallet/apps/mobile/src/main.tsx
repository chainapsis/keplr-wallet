import "./shim";
import { AppRegistry } from "react-native";

import { App } from "./app";
import { initBackground } from "./background";
import "react-native-gesture-handler";
initBackground();

AppRegistry.registerComponent("Mobile", () => App);
