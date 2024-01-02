/**
 * @format
 */

// import Bugsnag from "@bugsnag/react-native";
// import BugsnagPluginReactNavigation from "@bugsnag/plugin-react-navigation";
// import { codeBundleId } from "./bugsnag.env";

// Bugsnag.start({
//   plugins: [new BugsnagPluginReactNavigation()],
//   codeBundleId,
// });

import "./shim";

import "text-encoding";

import "react-native-gesture-handler";

import "react-native-url-polyfill/auto";

import { AppRegistry, LogBox } from "react-native";

import "./init";

// The use of "require" is intentional.
// In case of "import" statement, it is located before execution of the next line,
// so `getPlugin()` can be executed before `Bugsnag.start()`.
// To prevent this, "require" is used.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const App = require("./src/app").App;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appName = require("./app.json").name;

LogBox.ignoreLogs([
  "No native splash screen registered for given view controller. Call 'SplashScreen.show' for given view controller first.",
  "Possible Unhandled Promise Rejection",
  "Non-serializable values were found in the navigation state",
  "Require cycle: ../stores/build/common/query/index.js -> ../stores/build/common/query/json-rpc.js -> ../stores/build/common/query/index.js",
  "Require cycle: ../hooks/build/tx/index.js",
]);
AppRegistry.registerComponent(appName, () => App);
