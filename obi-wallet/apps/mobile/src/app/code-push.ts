import {
  APP_CENTER_DEPLOYMENT_KEY_PRODUCTION,
  APP_CENTER_DEPLOYMENT_KEY_STAGING,
  APP_ENV,
} from "react-native-dotenv";

import { envInvariant } from "../helpers/invariant";

envInvariant("APP_ENV", APP_ENV);
envInvariant(
  "APP_CENTER_DEPLOYMENT_KEY_PRODUCTION",
  APP_CENTER_DEPLOYMENT_KEY_PRODUCTION
);
envInvariant(
  "APP_CENTER_DEPLOYMENT_KEY_STAGING",
  APP_CENTER_DEPLOYMENT_KEY_STAGING
);

export const deploymentKey =
  APP_ENV === "production"
    ? APP_CENTER_DEPLOYMENT_KEY_PRODUCTION
    : APP_CENTER_DEPLOYMENT_KEY_STAGING;
