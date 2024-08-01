import { KVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction } from "mobx";

export class SettingsService {
  @observable
  protected settingsMap: Map<string, string> = new Map();

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    {
      const saved = await this.kvStore.get<Record<string, string | undefined>>(
        "settings"
      );
      if (saved) {
        runInAction(() => {
          for (const key of Object.keys(saved)) {
            const value = saved[key];
            if (value) {
              this.settingsMap.set(key, value);
            }
          }
        });
      }

      autorun(() => {
        this.kvStore.set("settings", Object.fromEntries(this.settingsMap));
      });
    }
  }

  getThemeOption(): string {
    return this.settingsMap.get("theme-option") ?? "dark";
  }

  setThemeOption(themeOption: string): void {
    this.settingsMap.set("theme-option", themeOption);
  }
}
