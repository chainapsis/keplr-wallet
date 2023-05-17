/**
 * Store the config related to UI.
 */
import { action, makeObservable, observable, runInAction, toJS } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { computedFn } from "mobx-utils";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

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

  @observable
  protected _icnsFrontendAllowlistChains: string = "";

  constructor(
    protected readonly kvStore: KVStore,
    _icnsInfo?: {
      readonly chainId: string;
      readonly resolverContractAddress: string;
    },
    _icnsFrontendLink?: string
  ) {
    this._isBeta = navigator.userAgent.includes("Firefox");
    this._platform = navigator.userAgent.includes("Firefox")
      ? "firefox"
      : "chrome";

    this._icnsInfo = _icnsInfo;
    this._icnsFrontendLink = _icnsFrontendLink || "";

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

    if (this.icnsFrontendLink) {
      try {
        const prev = await this.kvStore.get<string>("______icns___allowlist");
        if (prev) {
          runInAction(() => {
            this._icnsFrontendAllowlistChains = prev;
          });
        }

        const icnsAllowlistRes = await fetch(
          new URL("/api/allowlist", this.icnsFrontendLink).toString()
        );

        if (icnsAllowlistRes.ok && icnsAllowlistRes.status === 200) {
          const res = await icnsAllowlistRes.json();
          const chains = res?.chains || "";

          runInAction(() => {
            this._icnsFrontendAllowlistChains = chains;
          });
          await this.kvStore.set("______icns___allowlist", chains);
        }
      } catch (e) {
        console.log(e);
      }
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

  needShowICNSFrontendLink = computedFn((chainId: string): boolean => {
    if (!this.icnsFrontendLink) {
      return false;
    }

    if (!this._icnsFrontendAllowlistChains) {
      return true;
    }

    try {
      const allowIdentifiers = this._icnsFrontendAllowlistChains
        .split(",")
        .map((str) => str.trim())
        .filter((str) => str.length > 0)
        .map((chainId) => ChainIdHelper.parse(chainId).identifier);

      const allowIdentifierMap = new Map<string, boolean | undefined>();
      for (const identifier of allowIdentifiers) {
        allowIdentifierMap.set(identifier, true);
      }

      return (
        allowIdentifierMap.get(ChainIdHelper.parse(chainId).identifier) === true
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  });

  async save() {
    const data = toJS(this.options);
    await this.kvStore.set("options", data);
  }
}
