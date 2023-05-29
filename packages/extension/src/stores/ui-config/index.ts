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
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CopyAddressConfig } from "./copy-address";
import { ChainStore } from "../chain";
import { AddressBookConfig } from "./address-book";
import { MessageRequester } from "@keplr-wallet/router";

export interface UIConfigOptions {
  isDeveloperMode: boolean;
  hideLowBalance: boolean;
}

export class UIConfigStore {
  protected readonly kvStore: KVStore;

  public readonly copyAddressConfig: CopyAddressConfig;
  public readonly addressBookConfig: AddressBookConfig;

  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _options: UIConfigOptions = {
    isDeveloperMode: false,
    hideLowBalance: false,
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
  protected _fiatCurrency: string = "usd";

  constructor(
    protected readonly kvStores: {
      kvStore: KVStore;
      addressBookKVStore: KVStore;
    },
    protected readonly messageRequester: MessageRequester,
    protected readonly chainStore: ChainStore,
    protected readonly priceStore: CoinGeckoPriceStore,
    _icnsInfo?: {
      readonly chainId: string;
      readonly resolverContractAddress: string;
    }
  ) {
    this.kvStore = kvStores.kvStore;
    this.copyAddressConfig = new CopyAddressConfig(
      kvStores.kvStore,
      chainStore
    );
    this.addressBookConfig = new AddressBookConfig(
      kvStores.addressBookKVStore,
      messageRequester,
      chainStore
    );

    this._isBeta = navigator.userAgent.includes("Firefox");
    this._platform = navigator.userAgent.includes("Firefox")
      ? "firefox"
      : "chrome";

    this._icnsInfo = _icnsInfo;

    makeObservable(this);

    this.init();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  protected async init() {
    {
      const saved = await this.kvStore.get<string>("fiatCurrency");
      this.selectFiatCurrency(saved || "usd");
      autorun(() => {
        this.kvStore.set("fiatCurrency", this._fiatCurrency);
      });
    }

    {
      const saved = await this.kvStore.get<Partial<UIConfigOptions>>("options");
      if (saved) {
        runInAction(() => {
          for (const [key, value] of Object.entries(saved)) {
            if (value != null) {
              (this._options as any)[key] = value;
            }
          }
        });
      }

      autorun(() => {
        this.kvStore.set("options", toJS(this._options));
      });
    }

    await Promise.all([
      this.copyAddressConfig.init(),
      this.addressBookConfig.init(),
    ]);

    runInAction(() => {
      this._isInitialized = true;
    });
  }

  get options(): UIConfigOptions {
    return this._options;
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
  }

  get isHideLowBalance(): boolean {
    return this.options.hideLowBalance;
  }

  @action
  setHideLowBalance(value: boolean) {
    this.options.hideLowBalance = value;
  }

  @computed
  get fiatCurrency(): FiatCurrency {
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
    };
  }

  @action
  selectFiatCurrency(value: string) {
    this._fiatCurrency = value;
    this.priceStore.setDefaultVsCurrency(value);
  }

  get supportedFiatCurrencies() {
    return this.priceStore.supportedVsCurrencies;
  }

  get icnsInfo() {
    return this._icnsInfo;
  }
}
