/**
 * @format
 */

import "./shim";

import "text-encoding";

import "react-native-gesture-handler";

import "react-native-url-polyfill/auto";

import { AppRegistry } from "react-native";

import { App } from "./src/app";
import { name as appName } from "./app.json";

import "./init";

AppRegistry.registerComponent(appName, () => App);
