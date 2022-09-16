import "./shim";

import * as Sentry from "@sentry/react-native";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import codePush from "react-native-code-push";

import { App } from "./app";
import { deploymentKey } from "./app/code-push";
import { initBackground } from "./background";
import { initSentry } from "./background/sentry";

initSentry();
initBackground();

AppRegistry.registerComponent("Mobile", () => {
  let Component = Sentry.wrap(App);
  console.log({ deploymentKey }, 'key')
  if (true) {
    Component = codePush({
      checkFrequency: codePush.CheckFrequency.MANUAL,
      deploymentKey,
    })(Component);
  }

  return Component;
});
