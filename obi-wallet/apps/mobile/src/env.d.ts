declare module "react-native-dotenv" {
  import { Chain } from "@obi-wallet/common";

  export const APP_ENV: "development" | "staging" | "production";
  export const COSMOS_ENABLED: "true" | undefined;

  export const PHONE_NUMBER_KEY_SECRET: string;
  export const PHONE_NUMBER_TWILIO_BASIC_AUTH_USER: string;
  export const PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD: string;

  export const ENABLED_CHAINS: string;
  export const DEFAULT_CHAIN: Chain;

  export const ENABLED_LANGUAGES: string;
  export const DEFAULT_LANGUAGE: string;

  export const IOS_APP_CENTER_DEPLOYMENT_KEY_STAGING: string;
  export const IOS_APP_CENTER_DEPLOYMENT_KEY_PRODUCTION: string;
  export const ANDROID_APP_CENTER_DEPLOYMENT_KEY_STAGING: string;
  export const ANDROID_APP_CENTER_DEPLOYMENT_KEY_PRODUCTION: string;

  export const SENTRY_DSN: string;
  export const NFT_TAB_ENABLED: boolean;
}
