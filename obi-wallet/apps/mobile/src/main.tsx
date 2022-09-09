import "./shim";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import codePush from "react-native-code-push";
import { APP_CENTER_DEPLOYMENT_KEY } from "react-native-dotenv";

import { App } from "./app";
import { initBackground } from "./background";
import { initSentry } from "./background/sentry";

const CodePushOptions = {
  deploymentKey: APP_CENTER_DEPLOYMENT_KEY,
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
};
initSentry();
initBackground();

AppRegistry.registerComponent("Mobile", () =>
  __DEV__ ? App : codePush(CodePushOptions)(App)
);
