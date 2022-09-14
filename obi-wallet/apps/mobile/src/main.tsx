import "./shim";

import * as Sentry from "@sentry/react-native";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import codePush from "react-native-code-push";

import { App } from "./app";
import { initBackground } from "./background";
import { initSentry } from "./background/sentry";

initSentry();
initBackground();

AppRegistry.registerComponent("Mobile", () => {
  let Component = Sentry.wrap(App);

  if (!__DEV__) {
    Component = codePush({
      checkFrequency: codePush.CheckFrequency.MANUAL,
    })(Component);
  }

  return Component;
});
