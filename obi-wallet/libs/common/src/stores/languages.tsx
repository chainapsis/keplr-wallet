import { KVStore } from "@keplr-wallet/common";
import { action, makeObservable, observable, runInAction } from "mobx";
import { Platform, NativeModules, Image } from "react-native";

export interface LangProps {
  languagecode: string;
  language: string;
  icon: any;
}

const languageArray: LangProps[] = [
  {
    languagecode: "en",
    language: "English",
    icon: () => (
      <Image
        source={require("./assets/flag-us.png")}
        style={{ width: 25, height: 25, marginRight: 10 }}
      />
    ),
  },
  {
    languagecode: "de",
    language: "Deutsch",
    icon: () => (
      <Image
        source={require("./assets/flag-de.png")}
        style={{ width: 25, height: 25, marginRight: 10 }}
      />
    ),
  },
  {
    languagecode: "es",
    language: "Espanol",
    icon: () => (
      <Image
        source={require("./assets/flag-es.png")}
        style={{ width: 25, height: 25, marginRight: 10 }}
      />
    ),
  },
];

const deviceLanguage =
  Platform.OS === "ios"
    ? NativeModules.SettingsManager.settings.AppleLocale || // iOS
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier; // Android

const modifiedDeviceLanguage = deviceLanguage.substr(0, 2); // use substr because output of deviceLanguage can be "de_US"

const findDeviceLanguageInLanguageArray = () => {
  const languageArrayContainsDeviceLanguage = languageArray.find(
    (object) => object.languagecode === modifiedDeviceLanguage
  );

  if (languageArrayContainsDeviceLanguage) {
    return languageArrayContainsDeviceLanguage;
  } else {
    return languageArray[0];
  }
};

export class LanguageStore {
  @observable
  protected languages: LangProps[] = [];

  @observable
  public currentLanguage: LangProps = findDeviceLanguageInLanguageArray();

  constructor(protected kvStore: KVStore) {
    makeObservable(this);
    void this.init();
  }

  public getLanguages() {
    return languageArray;
  }

  @observable
  public async init() {
    const currentLanguage = await this.kvStore.get<LangProps | undefined>(
      "currentLanguage"
    );
    runInAction(() => {
      if (currentLanguage) {
        this.currentLanguage = currentLanguage;
      }
    });
  }

  @action
  public async setCurrentLanguage(selectedLanguage: LangProps) {
    this.currentLanguage = selectedLanguage;
    const data = selectedLanguage;
    await this.kvStore.set("currentLanguage", data);
  }
}
