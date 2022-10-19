import { action, makeObservable, observable } from "mobx";

export class SettingsStore {
  @observable
  public isObi = false;
  constructor() {
    makeObservable(this);
  }
  @action
  public toggleObiMode() {
    this.isObi = !this.isObi;
  }
}
