import { KVStore, toGenerator } from "@keplr-wallet/common";
import { action, flow, makeObservable, observable, runInAction } from "mobx";

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
