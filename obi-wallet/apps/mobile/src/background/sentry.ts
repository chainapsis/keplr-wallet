import * as Sentry from "@sentry/react-native";
import { SENTRY_DSN } from "react-native-dotenv";

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
  });
}
