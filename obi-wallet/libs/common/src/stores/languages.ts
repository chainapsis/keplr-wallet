import { KVStore } from "@keplr-wallet/common";
import { action, makeObservable, observable, runInAction, toJS } from "mobx";

export interface LangProps {
  languagecode: string;
  language: string;
  flag: string;
}

const languageArray: LangProps[] = [
  {
      languagecode: "en",
      language: "English",
      flag: require('../languages/flag-us.png'),
  },
  {
      languagecode: "de",
      language: "Deutsch",
      flag: require('../languages/flag-de.png'),
  },
  {
      languagecode: "es",
      language: "Espanol",
      flag: require('../languages/flag-es.png'),
  },
];

export class LanguageStore {
  @observable
  protected languages: LangProps[] = [];

  @observable
  public currentLanguage: LangProps = languageArray[0]

  constructor(protected kvStore: KVStore) {
    makeObservable(this);
    void this.init();
  }

  public getLanguages() {
    return languageArray;
  }

  @observable
  public async init() {
    const currentLanguage = await this.kvStore.get<LangProps | undefined>("currentLanguage");
    runInAction(() => {
      if (currentLanguage) {
        this.currentLanguage = currentLanguage;
      }
    });
  }

  @action
  public async setCurrentLanguage(selectedLanguage: LangProps) {
    this.currentLanguage = selectedLanguage
    const data = selectedLanguage;
    await this.kvStore.set("currentLanguage", data);
  }

}
