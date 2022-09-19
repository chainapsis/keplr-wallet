import { RootStore } from "@obi-wallet/common";
import { NativeModules, Platform } from "react-native";
import {
  DEFAULT_CHAIN,
  DEFAULT_LANGUAGE,
  ENABLED_LANGUAGES,
} from "react-native-dotenv";

import { envInvariant } from "../helpers/invariant";

const deviceLanguage =
  Platform.OS === "ios"
    ? NativeModules.SettingsManager.settings.AppleLocale || // iOS
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier; // Android

envInvariant("DEFAULT_CHAIN", DEFAULT_CHAIN);
envInvariant("DEFAULT_LANGUAGE", DEFAULT_LANGUAGE);
envInvariant("ENABLED_LANGUAGES", ENABLED_LANGUAGES);

export const rootStore = new RootStore({
  defaultChain: DEFAULT_CHAIN,
  deviceLanguage: deviceLanguage.slice(0, 2),
  enabledLanguages: ENABLED_LANGUAGES.split(","),
  defaultLanguage: DEFAULT_LANGUAGE,
});
