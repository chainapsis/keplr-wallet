import "./shim";

import * as Sentry from "@sentry/react-native";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import codePush from "react-native-code-push";
import {
  APP_CENTER_DEPLOYMENT_KEY_STAGING,
  APP_CENTER_DEPLOYMENT_KEY_PRODUCTION,
  APP_ENV,
} from "react-native-dotenv";

import { App } from "./app";
import { initBackground } from "./background";
import { initSentry } from "./background/sentry";

initSentry();
initBackground();

AppRegistry.registerComponent("Mobile", () => {
  let Component = Sentry.wrap(App);

  if (!__DEV__) {
    Component = codePush({
      deploymentKey:
        APP_ENV === "production"
          ? APP_CENTER_DEPLOYMENT_KEY_PRODUCTION
          : APP_CENTER_DEPLOYMENT_KEY_STAGING,
      checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
      installMode: codePush.InstallMode.ON_NEXT_RESUME,
    })(Component);
  }

  return Component;
});
