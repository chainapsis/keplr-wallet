/**
 * Store the config related to UI.
 */
import { action, makeObservable, observable, runInAction, toJS } from "mobx";
import { KVStore } from "@keplr-wallet/common";

export interface UIConfigOptions {
  isDeveloperMode: boolean;
}

export class UIConfigStore {
  @observable.deep
  protected options: UIConfigOptions = {
    isDeveloperMode: false,
  };

  protected _isBeta: boolean;
  protected _platform: "chrome" | "firefox" = "chrome";

  // Struct is required for compatibility with recipient config hook
  @observable.struct
  protected _icnsInfo:
    | {
        readonly chainId: string;
        readonly resolverContractAddress: string;
      }
    | undefined = undefined;

  constructor(
    protected readonly kvStore: KVStore,
    _icnsInfo:
      | {
          readonly chainId: string;
          readonly resolverContractAddress: string;
        }
      | undefined
  ) {
    this._isBeta = navigator.userAgent.includes("Firefox");
    this._platform = navigator.userAgent.includes("Firefox")
      ? "firefox"
      : "chrome";

    this._icnsInfo = _icnsInfo;

    makeObservable(this);

    this.init();
  }

  protected async init() {
    // There is no guarantee that this value will contain all options fields, as the options field may be added later.
    // showAdvancedIBCTransfer is legacy value
    const data = await this.kvStore.get<
      Partial<UIConfigOptions & { showAdvancedIBCTransfer: boolean }>
    >("options");

    if (data?.showAdvancedIBCTransfer) {
      // remove showAdvancedIBCTransfer legacy value
      await this.kvStore.set("options", { isDeveloperMode: true });

      this.options.isDeveloperMode = true;
    }

    runInAction(() => {
      this.options = {
        ...this.options,
        ...data,
      };
    });
  }

  get isBeta(): boolean {
    return this._isBeta;
  }

  get platform(): "chrome" | "firefox" {
    return this._platform;
  }

  get isDeveloper(): boolean {
    return this.options.isDeveloperMode;
  }

  @action
  setDeveloperMode(value: boolean) {
    this.options.isDeveloperMode = value;

    // No need to await
    this.save();
  }

  get icnsInfo() {
    return this._icnsInfo;
  }

  async save() {
    const data = toJS(this.options);
    await this.kvStore.set("options", data);
  }
}
