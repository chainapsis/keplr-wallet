import "./shim";

import * as Sentry from "@sentry/react-native";
import { AppRegistry, LogBox } from "react-native";
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

LogBox.ignoreLogs([
  // See https://github.com/software-mansion/react-native-reanimated/issues/2911
  "Warning: Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move code with side effects to componentDidMount, and set initial state in the constructor.\n\nPlease update the following components: AnimatedComponent",
  "Warning: Using UNSAFE_componentWillReceiveProps in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move data fetching code or side effects to componentDidUpdate.\n* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state\n\nPlease update the following components: AnimatedComponent",
  "Warning: findNodeHandle is deprecated in StrictMode. findNodeHandle was passed an instance of AnimatedComponent(View) which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node",
  "Warning: findNodeHandle is deprecated in StrictMode. findNodeHandle was passed an instance of ScrollView which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node",

  // Keplr-related
  "The `gasPriceStep` field of the `ChainInfo` has been moved under `feeCurrencies`. This is automatically handled as of right now, but the upcoming update would potentially cause errors.",
]);

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
