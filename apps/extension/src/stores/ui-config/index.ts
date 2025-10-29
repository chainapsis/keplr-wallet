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
import { CoinGeckoPriceStore, IQueriesStore } from "@keplr-wallet/stores";
import { KeyRingStore } from "@keplr-wallet/stores-core";
import { FiatCurrency } from "@keplr-wallet/types";
import { CopyAddressConfig } from "./copy-address";
import { ChainStore } from "../chain";
import { AddressBookConfig } from "./address-book";
import { MessageRequester } from "@keplr-wallet/router";
import manifest from "../../manifest.v2.json";
import { IBCSwapConfig } from "./ibc-swap";
import { NewChainSuggestionConfig } from "./new-chain";
import { ChangelogConfig } from "./changelog";
import { SelectWalletConfig } from "./select-wallet";
import { ManageViewAssetTokenConfig } from "./manage-view-asset-token";

export interface UIConfigOptions {
  isDeveloperMode: boolean;
  assetViewMode: "grouped" | "flat";
  hideLowBalance: boolean;
  showFiatValue: boolean;
  showSearchBar: boolean;
  switchAssetViewModeSuggestion: boolean;
  isPrivacyMode: boolean;
  rememberLastFeeOption: boolean;
  lastFeeOption: "low" | "average" | "high" | false;
  show24HChangesInMagePage: boolean;

  useWebHIDLedger: boolean;
}

export class UIConfigStore {
  protected readonly kvStore: KVStore;

  public readonly copyAddressConfig: CopyAddressConfig;
  public readonly addressBookConfig: AddressBookConfig;
  public readonly ibcSwapConfig: IBCSwapConfig;
  public readonly changelogConfig: ChangelogConfig;
  public readonly newChainSuggestionConfig: NewChainSuggestionConfig;
  public readonly selectWalletConfig: SelectWalletConfig;
  public readonly manageViewAssetTokenConfig: ManageViewAssetTokenConfig;
  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _options: UIConfigOptions = {
    isDeveloperMode: false,
    assetViewMode: "flat",
    hideLowBalance: false,
    showFiatValue: true,
    isPrivacyMode: false,
    showSearchBar: false,
    rememberLastFeeOption: false,
    lastFeeOption: false,
    show24HChangesInMagePage: true,
    switchAssetViewModeSuggestion: true,

    useWebHIDLedger: false,
  };

  @observable
  protected _isBeta: boolean = false;
  @observable
  protected _platform: "not-init" | "chrome" | "firefox" = "not-init";

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
    protected readonly queriesStore: IQueriesStore,
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
    this.ibcSwapConfig = new IBCSwapConfig(
      kvStores.kvStore,
      chainStore,
      queriesStore
    );
    this.changelogConfig = new ChangelogConfig(kvStores.kvStore);
    this.newChainSuggestionConfig = new NewChainSuggestionConfig(
      kvStores.kvStore,
      chainStore,
      this.changelogConfig
    );
    this.selectWalletConfig = new SelectWalletConfig(kvStores.kvStore);
    this.manageViewAssetTokenConfig = new ManageViewAssetTokenConfig(
      messageRequester,
      chainStore,
      keyRingStore
    );
    this._icnsInfo = _icnsInfo;

    makeObservable(this);

    this.init();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  protected async init() {
    const lastVersion = await this.kvStore.get<string>("lastVersion");
    {
      this._currentVersion = manifest.version;

      const installedVersion = await this.kvStore.get<string>(
        "installedVersion"
      );
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
      this.changelogConfig.init(
        lastVersion || this._currentVersion,
        this._currentVersion
      ),
      this.newChainSuggestionConfig.init(
        this._installedVersion,
        this._currentVersion
      ),
      this.manageViewAssetTokenConfig.init(),
      (async () => {
        let isFirefox = false;
        if (typeof browser.runtime.getBrowserInfo === "function") {
          const browserInfo = await browser.runtime.getBrowserInfo();
          if (browserInfo.name === "Firefox") {
            isFirefox = true;
          }
        }
        if (isFirefox) {
          runInAction(() => {
            this._isBeta = true;
            this._platform = "firefox";
          });
        } else {
          runInAction(() => {
            this._isBeta = false;
            this._platform = "chrome";
          });
        }
      })(),
      this.selectWalletConfig.init(),
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

  get platform(): "not-init" | "chrome" | "firefox" {
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

  @action
  toggleHideLowBalance() {
    this.options.hideLowBalance = !this.options.hideLowBalance;
  }

  get switchAssetViewModeSuggestion(): boolean {
    return this.options.switchAssetViewModeSuggestion;
  }

  @action
  turnOffSwitchAssetViewModeSuggestion() {
    this.options.switchAssetViewModeSuggestion = false;
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

  get assetViewMode(): "grouped" | "flat" {
    return this.options.assetViewMode;
  }

  @action
  setAssetViewMode(value: "grouped" | "flat") {
    this.options.assetViewMode = value;
  }

  get showFiatValue(): boolean {
    return this.options.showFiatValue;
  }

  @action
  setShowFiatValue(value: boolean) {
    this.options.showFiatValue = value;
  }

  @action
  toggleShowFiatValue() {
    this.options.showFiatValue = !this.options.showFiatValue;
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

  @action
  toggleShow24HChangesInMagePage() {
    this.options.show24HChangesInMagePage =
      !this.options.show24HChangesInMagePage;
  }

  get show24HChangesInMagePage(): boolean {
    return this.options.show24HChangesInMagePage;
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

  get isShowSearchBar(): boolean {
    return this.options.showSearchBar;
  }

  @action
  setShowSearchBar(value: boolean) {
    this.options.showSearchBar = value;
  }

  @action
  toggleShowSearchBar() {
    this.options.showSearchBar = !this.options.showSearchBar;
  }
}
