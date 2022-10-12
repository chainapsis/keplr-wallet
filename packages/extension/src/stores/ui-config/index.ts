/**
 * Store the config related to UI.
 */
import { action, makeObservable, observable, runInAction, toJS } from "mobx";
import { KVStore } from "@keplr-wallet/common";

export interface UIConfigOptions {
  showAdvancedIBCTransfer: boolean;
  showRawSuggestedChainInfo: boolean;
}

export class UIConfigStore {
  @observable.deep
  protected options: UIConfigOptions = {
    showAdvancedIBCTransfer: false,
    showRawSuggestedChainInfo: false,
  };

  protected _isBeta: boolean;
  protected _platform: "chrome" | "firefox" = "chrome";

  constructor(protected readonly kvStore: KVStore) {
    this._isBeta = navigator.userAgent.includes("Firefox");
    this._platform = navigator.userAgent.includes("Firefox")
      ? "firefox"
      : "chrome";

    makeObservable(this);

    this.init();
  }

  protected async init() {
    // There is no guarantee that this value will contain all options fields, as the options field may be added later.
    const data = await this.kvStore.get<Partial<UIConfigOptions>>("options");

    runInAction(() => {
      console.log("here", this.options);
      this.options = {
        ...this.options,
        ...data,
      };
    });
  }

  /**
   * Currently, keplr only supports the IBC UI which the users should set the counterparty channel manually.
   * However, it makes the normal users take a mistake.
   * So, to reduce this problem, show the IBC UI to users who only turns on the `showAdvancedIBCTransfer` explicitly.
   */
  get showAdvancedIBCTransfer(): boolean {
    return this.options.showAdvancedIBCTransfer;
  }

  get showRawSuggestedChainInfo(): boolean {
    return this.options.showRawSuggestedChainInfo;
  }

  get isBeta(): boolean {
    return this._isBeta;
  }

  get platform(): "chrome" | "firefox" {
    return this._platform;
  }

  @action
  setDeveloperMode(value: boolean) {
    this.options.showAdvancedIBCTransfer = value;
    this.options.showRawSuggestedChainInfo = value;

    // No need to await
    this.save();
  }

  async save() {
    const data = toJS(this.options);
    await this.kvStore.set("options", data);
  }
}
