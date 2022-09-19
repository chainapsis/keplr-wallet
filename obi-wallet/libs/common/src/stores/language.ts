import { KVStore, toGenerator } from "@keplr-wallet/common";
import { action, flow, makeObservable, observable, runInAction } from "mobx";

export class LanguageStore {
  protected readonly kvStore: KVStore;
  public readonly enabledLanguages: string[];

  @observable
  public currentLanguage: string;

  constructor({
    deviceLanguage,
    enabledLanguages,
    defaultLanguage,
    kvStore,
  }: {
    defaultLanguage: string;
    deviceLanguage: string;
    enabledLanguages: string[];
    kvStore: KVStore;
  }) {
    this.currentLanguage =
      enabledLanguages.find((lang) => lang === deviceLanguage) ??
      defaultLanguage;
    this.enabledLanguages = enabledLanguages;
    this.kvStore = kvStore;
    makeObservable(this);
    this.init();
  }

  @flow
  protected async *init() {
    const currentLanguage = yield* toGenerator(
      this.kvStore.get<string | undefined>("currentLanguage")
    );

    if (currentLanguage && this.enabledLanguages.includes(currentLanguage)) {
      runInAction(() => {
        this.currentLanguage = currentLanguage;
      });
    }
  }

  @action
  public setCurrentLanguage(selectedLanguage: string) {
    this.currentLanguage = selectedLanguage;
    void this.save();
  }

  protected async save() {
    await this.kvStore.set("currentLanguage", this.currentLanguage);
  }
}
