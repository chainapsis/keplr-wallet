import { KVStore } from "@keplr-wallet/common";
import { action, makeObservable, observable, runInAction } from "mobx";
import { Platform, NativeModules } from 'react-native'

export interface LangProps {
  languagecode: string;
  language: string;
  flag: string;
}

const languageArray: LangProps[] = [
  {
    languagecode: "en",
    language: "English",
    flag: require("../languages/flag-us.png"),
  },
  {
    languagecode: "de",
    language: "Deutsch",
    flag: require("../languages/flag-de.png"),
  },
  {
    languagecode: "es",
    language: "Espanol",
    flag: require("../languages/flag-es.png"),
  },
];

const deviceLanguage =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale || // iOS
          NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
        : NativeModules.I18nManager.localeIdentifier; // Android

const modifiedDeviceLanguage = deviceLanguage.substr(0,2) // use substr because output of deviceLanguage can be "de_US"
//console.log('##### deviceLanguage', modifiedDeviceLanguage);


const findDeviceLanguageInLanguageArray = () => {

  const languageArrayContainsDeviceLanguage = languageArray.find((object) => object.languagecode === modifiedDeviceLanguage)
  
  if (languageArrayContainsDeviceLanguage) {
    //console.log("languageArrayContainsDeviceLanguage: ", languageArrayContainsDeviceLanguage)
    return languageArrayContainsDeviceLanguage
  }
  else {
    //console.log("Using default language EN")
    return languageArray[0]
  }
}

export class LanguageStore {
  @observable
  protected languages: LangProps[] = [];

  @observable
  //public currentLanguage: LangProps = languageArray[0];
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
