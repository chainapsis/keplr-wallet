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
import { CoinGeckoPriceStore, KeyRingStore } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CopyAddressConfig } from "./copy-address";
import { ChainStore } from "../chain";
import { AddressBookConfig } from "./address-book";
import { MessageRequester } from "@keplr-wallet/router";
import manifest from "../../manifest.v2.json";
import { IBCSwapConfig } from "./ibc-swap";
import semver from "semver";

export interface UIConfigOptions {
  isDeveloperMode: boolean;
  hideLowBalance: boolean;

  useWebHIDLedger: boolean;
}

export class UIConfigStore {
  protected readonly kvStore: KVStore;

  public readonly copyAddressConfig: CopyAddressConfig;
  public readonly addressBookConfig: AddressBookConfig;
  public readonly ibcSwapConfig: IBCSwapConfig;

  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _options: UIConfigOptions = {
    isDeveloperMode: false,
    hideLowBalance: false,

    useWebHIDLedger: false,
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

  @observable
  protected _needShowIBCSwapFeatureAdded: boolean = false;

  constructor(
    protected readonly kvStores: {
      kvStore: KVStore;
      addressBookKVStore: KVStore;
    },
    protected readonly messageRequester: MessageRequester,
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore,
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
      chainStore,
      keyRingStore
    );
    this.ibcSwapConfig = new IBCSwapConfig(kvStores.kvStore, chainStore);

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
    // Set the last version to the kv store.
    // This can be used to show the changelog.
    {
      const lastVersion = await this.kvStore.get<string>("lastVersion");
      if (lastVersion) {
        try {
          if (semver.lte(lastVersion, "0.12.28")) {
            this._needShowIBCSwapFeatureAdded = true;
          }
        } catch (e) {
          console.log(e);
        }
      }

      await this.kvStore.set("lastVersion", manifest.version);
    }

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

    {
      const saved = await this.kvStore.get<boolean>(
        "needShowIBCSwapFeatureAdded"
      );
      if (saved === true) {
        this._needShowIBCSwapFeatureAdded = saved;
      }
      autorun(() => {
        this.kvStore.set(
          "needShowIBCSwapFeatureAdded",
          this._needShowIBCSwapFeatureAdded
        );
      });
    }

    await Promise.all([
      this.copyAddressConfig.init(),
      this.addressBookConfig.init(),
      this.ibcSwapConfig.init(),
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

  get useWebHIDLedger(): boolean {
    if (!window.navigator.hid) {
      return false;
    }

    return this.options.useWebHIDLedger;
  }

  @action
  setUseWebHIDLedger(value: boolean) {
    this.options.useWebHIDLedger = value;
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

  async removeStatesWhenErrorOccurredDuringRending() {
    await this.ibcSwapConfig.removeStatesWhenErrorOccurredDuringRending();
  }

  get needShowIBCSwapFeatureAdded(): boolean {
    return this._needShowIBCSwapFeatureAdded;
  }

  @action
  setNeedShowIBCSwapFeatureAdded(value: boolean) {
    this._needShowIBCSwapFeatureAdded = value;
  }
}
