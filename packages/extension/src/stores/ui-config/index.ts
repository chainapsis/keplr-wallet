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

  @observable
  protected _icnsFrontendLink: string = "";

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

    try {
      // Temporal solution for ICNS updates dynamically.
      const data = await this.kvStore.get<{
        readonly chainId: string;
        readonly resolverContractAddress: string;
      }>("________temp____icns_updates");

      if (data) {
        runInAction(() => {
          this._icnsInfo = data;
        });
      }

      {
        const data = await this.kvStore.get<string>(
          "________temp____icns_updates__link"
        );
        if (data) {
          runInAction(() => {
            this._icnsFrontendLink = data;
          });
        }
      }

      const icnsInfoFetched = await fetch(
        "https://icns-updates.s3.us-west-2.amazonaws.com/icns-info.json"
      );

      if (icnsInfoFetched.ok) {
        const icnsInfo = await icnsInfoFetched.json();

        console.log("ICNS info fetched", icnsInfo);

        if (icnsInfo && typeof icnsInfo.icnsFrontendLink === "string") {
          runInAction(() => {
            this._icnsFrontendLink = icnsInfo.icnsFrontendLink;
          });

          await this.kvStore.set(
            "________temp____icns_updates__link",
            icnsInfo.icnsFrontendLink
          );
        } else {
          runInAction(() => {
            this._icnsFrontendLink = "";
          });

          await this.kvStore.set("________temp____icns_updates__link", null);
        }

        if (
          icnsInfo &&
          typeof icnsInfo.chainId === "string" &&
          typeof icnsInfo.resolverContractAddress === "string"
        ) {
          runInAction(() => {
            this._icnsInfo = {
              chainId: icnsInfo.chainId,
              resolverContractAddress: icnsInfo.resolverContractAddress,
            };
          });

          await this.kvStore.set("________temp____icns_updates", {
            chainId: icnsInfo.chainId,
            resolverContractAddress: icnsInfo.resolverContractAddress,
          });
        } else {
          runInAction(() => {
            this._icnsInfo = undefined;
          });

          await this.kvStore.set("________temp____icns_updates", null);
        }
      }
    } catch (e) {
      console.log(e);
    }
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

  get icnsFrontendLink(): string {
    return this._icnsFrontendLink;
  }

  async save() {
    const data = toJS(this.options);
    await this.kvStore.set("options", data);
  }
}
