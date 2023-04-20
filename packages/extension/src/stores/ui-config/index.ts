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

export interface UIConfigOptions {
  isDeveloperMode: boolean;
}

export class UIConfigStore {
  protected readonly kvStore: KVStore;

  public readonly copyAddressConfig: CopyAddressConfig;
  public readonly addressBookConfig: AddressBookConfig;

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

  // undefined means "automatic"
  // If this value is undefined, the actual `fiatCurrency` getter should determine the fiat currency.
  @observable
  protected _fiatCurrency: string | undefined = undefined;

  constructor(
    protected readonly kvStores: {
      kvStore: KVStore;
      addressBookKVStore: KVStore;
    },
    protected readonly chainStore: ChainStore,
    protected readonly priceStore: CoinGeckoPriceStore,
    _icnsInfo?: {
      readonly chainId: string;
      readonly resolverContractAddress: string;
    },
    _icnsFrontendLink?: string
  ) {
    this.kvStore = kvStores.kvStore;
    this.copyAddressConfig = new CopyAddressConfig(
      kvStores.kvStore,
      chainStore
    );
    this.addressBookConfig = new AddressBookConfig(
      kvStores.addressBookKVStore,
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

    await Promise.all([
      this.copyAddressConfig.init(),
      this.addressBookConfig.init(),
    ]);

    runInAction(() => {
      this._isInitialized = true;
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

  async save() {
    const data = toJS(this.options);
    await this.kvStore.set("options", data);
  }
}
