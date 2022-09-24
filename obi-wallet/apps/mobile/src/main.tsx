import "./shim";

import * as Sentry from "@sentry/react-native";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import codePush from "react-native-code-push";
import { COSMOS_ENABLED } from "react-native-dotenv";

import { App } from "./app";
import { deploymentKey } from "./app/code-push";
import { initBackground } from "./background";
import { initSentry } from "./background/sentry";
import { Cosmos } from "./cosmos";

initSentry();
initBackground();

AppRegistry.registerComponent("Mobile", () => {
  if (__DEV__ && COSMOS_ENABLED === "true") return Cosmos;

  let Component = Sentry.wrap(App);

  if (!__DEV__) {
    Component = codePush({
      checkFrequency: codePush.CheckFrequency.MANUAL,
      deploymentKey,
    })(Component);
  }

  return Component;
});
