import * as Sentry from "@sentry/react-native";
import { APP_ENV, SENTRY_DSN } from "react-native-dotenv";

import { envInvariant } from "../helpers/invariant";

envInvariant("APP_ENV", APP_ENV);

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: __DEV__ ? 1.0 : 0.5,
    environment: APP_ENV,
  });
}
