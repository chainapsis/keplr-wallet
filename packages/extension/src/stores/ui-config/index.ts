/**
 * Store the config related to UI.
 */
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { computedFn } from "mobx-utils";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";

export interface UIConfigOptions {
  isDeveloperMode: boolean;
}

export class UIConfigStore {
  @observable
  protected _isInitialized: boolean = false;

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

  // undefined means "automatic"
  // If this value is undefined, the actual `fiatCurrency` getter should determine the fiat currency.
  @observable
  protected _fiatCurrency: string | undefined = undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly priceStore: CoinGeckoPriceStore,
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

  get isInitialized(): boolean {
    return this._isInitialized;
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

    {
      const saved = await this.kvStore.get<string>("fiatCurrency");
      if (saved) {
        this.selectFiatCurrency(saved);
      } else {
        this.selectFiatCurrency(undefined);
      }
      autorun(() => {
        this.kvStore.set("fiatCurrency", this._fiatCurrency);
      });
    }

    runInAction(() => {
      this.options = {
        ...this.options,
        ...data,
      };
    });

    runInAction(() => {
      this._isInitialized = true;
    });
    // XXX: Below logic has fetching logic, so it should not be included in initialization logic.

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

  @computed
  get fiatCurrency(): FiatCurrency & {
    isAutomatic?: boolean;
  } {
    let fiatCurrency = this._fiatCurrency;
    if (!fiatCurrency) {
      // TODO: How to handle "automatic"?
      fiatCurrency = "usd";
    }

    return {
      ...(this.priceStore.supportedVsCurrencies[fiatCurrency] ?? {
        currency: "usd",
        symbol: "$",
        maxDecimals: 2,
        locale: "en-US",
      }),
      isAutomatic: !this._fiatCurrency,
    };
  }

  @action
  selectFiatCurrency(value: string | undefined) {
    this._fiatCurrency = value;
    if (!value) {
      // TODO: How to handle "automatic"?
      this.priceStore.setDefaultVsCurrency("usd");
    } else {
      this.priceStore.setDefaultVsCurrency(value);
    }
  }

  get supportedFiatCurrencies() {
    return this.priceStore.supportedVsCurrencies;
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
