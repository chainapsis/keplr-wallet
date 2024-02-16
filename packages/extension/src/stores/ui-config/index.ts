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
import { KeyRingStore } from "@keplr-wallet/stores-core";
import { FiatCurrency } from "@keplr-wallet/types";
import { CopyAddressConfig } from "./copy-address";
import { ChainStore } from "../chain";
import { AddressBookConfig } from "./address-book";
import { MessageRequester } from "@keplr-wallet/router";
import manifest from "../../manifest.v2.json";
import { IBCSwapConfig } from "./ibc-swap";
import { NewChainSuggestionConfig } from "./new-chain";

export interface UIConfigOptions {
  isDeveloperMode: boolean;
  hideLowBalance: boolean;
  isPrivacyMode: boolean;
  rememberLastFeeOption: boolean;
  lastFeeOption: "low" | "average" | "high" | false;

  useWebHIDLedger: boolean;
}

export class UIConfigStore {
  protected readonly kvStore: KVStore;

  public readonly copyAddressConfig: CopyAddressConfig;
  public readonly addressBookConfig: AddressBookConfig;
  public readonly ibcSwapConfig: IBCSwapConfig;
  public readonly newChainSuggestionConfig: NewChainSuggestionConfig;

  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _options: UIConfigOptions = {
    isDeveloperMode: false,
    hideLowBalance: false,
    isPrivacyMode: false,
    rememberLastFeeOption: false,
    lastFeeOption: false,

    useWebHIDLedger: false,
  };

  protected _isBeta: boolean;
  protected _platform: "chrome" | "firefox" = "chrome";

  protected _installedVersion: string = "";
  protected _currentVersion: string = "";

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
    this.newChainSuggestionConfig = new NewChainSuggestionConfig(
      kvStores.kvStore,
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
      this._currentVersion = manifest.version;

      const installedVersion = await this.kvStore.get<string>(
        "installedVersion"
      );
      const lastVersion = await this.kvStore.get<string>("lastVersion");
      if (!installedVersion) {
        if (lastVersion) {
          // installedVersion은 처음부터 존재했던게 아니라 중간에 추가되었기 때문에 정확하게 알 수 없다.
          // 유저가 실제로 install 했던 버전이거나 installedVersion이 추가되기 직전에 유저가 마지막으로 사용했던 버전을 나타낸다.
          await this.kvStore.set("installedVersion", lastVersion);
          this._installedVersion = lastVersion;
        } else {
          await this.kvStore.set("installedVersion", this._currentVersion);
          this._installedVersion = this._currentVersion;
        }
      } else {
        this._installedVersion = installedVersion;
      }

      await this.kvStore.set("lastVersion", this._currentVersion);
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

    await Promise.all([
      this.copyAddressConfig.init(),
      this.addressBookConfig.init(),
      this.ibcSwapConfig.init(),
      this.newChainSuggestionConfig.init(
        this._installedVersion,
        this._currentVersion
      ),
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

  get isPrivacyMode(): boolean {
    return this.options.isPrivacyMode;
  }

  @action
  setIsPrivacyMode(value: boolean) {
    this.options.isPrivacyMode = value;
  }

  @action
  toggleIsPrivacyMode() {
    this.options.isPrivacyMode = !this.options.isPrivacyMode;
  }

  hideStringIfPrivacyMode(str: string, numStars: number): string {
    if (this.isPrivacyMode) {
      return "*".repeat(numStars);
    }
    return str;
  }

  @action
  setRememberLastFeeOption(value: boolean) {
    this.options.rememberLastFeeOption = value;
  }

  get rememberLastFeeOption(): boolean {
    return this.options.rememberLastFeeOption;
  }

  @action
  setLastFeeOption(value: "low" | "average" | "high" | false) {
    this.options.lastFeeOption = value;
  }

  get lastFeeOption(): "low" | "average" | "high" | false {
    return this.options.lastFeeOption;
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
    await this.ibcSwapConfig.removeStatesWhenErrorOccurredDuringRendering();
    await this.newChainSuggestionConfig.removeStatesWhenErrorOccurredDuringRendering();
  }
}
