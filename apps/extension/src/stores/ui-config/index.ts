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
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import manifest from "../../manifest.v2.json";
import { IBCSwapConfig } from "./ibc-swap";
import { NewChainSuggestionConfig } from "./new-chain";
import { ChangelogConfig } from "./changelog";
import { SelectWalletConfig } from "./select-wallet";
import { GetSidePanelIsSupportedMsg } from "@keplr-wallet/background";
import { isRunningInSidePanel } from "../../utils";
import { ManageViewAssetTokenConfig } from "./manage-view-asset-token";

export interface UIConfigOptions {
  isDeveloperMode: boolean;
  hideLowBalance: boolean;
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
    hideLowBalance: false,
    isPrivacyMode: false,
    rememberLastFeeOption: false,
    lastFeeOption: false,
    show24HChangesInMagePage: true,

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

  @observable
  protected _showNewSidePanelHeaderTop: boolean = false;

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

    {
      const saved = await this.kvStore.get<boolean>(
        "__showNewSidePanelHeaderTop"
      );
      if (saved == null) {
        if (!isRunningInSidePanel()) {
          const msg = new GetSidePanelIsSupportedMsg();
          const res = await this.messageRequester.sendMessage(
            BACKGROUND_PORT,
            msg
          );
          if (res.supported) {
            runInAction(() => {
              this._showNewSidePanelHeaderTop = true;
            });
          }
        }
      } else {
        runInAction(() => {
          this._showNewSidePanelHeaderTop = saved;
        });
      }

      const pathname = new URL(window.location.href).pathname;
      // popup 외에 register 등의 페이지도 존재하는데 이 페이지들은 sidePanel과 관련이 없으니 그 경우는 무시한다.
      if (pathname === "/sidePanel.html" || pathname === "/popup.html") {
        autorun(() => {
          this.kvStore.set(
            "__showNewSidePanelHeaderTop",
            this._showNewSidePanelHeaderTop
          );
        });
      }
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

  get showNewSidePanelHeaderTop(): boolean {
    return this._showNewSidePanelHeaderTop;
  }

  @action
  setShowNewSidePanelHeaderTop(value: boolean) {
    this._showNewSidePanelHeaderTop = value;
  }

  async removeStatesWhenErrorOccurredDuringRending() {
    await this.ibcSwapConfig.removeStatesWhenErrorOccurredDuringRendering();
    await this.newChainSuggestionConfig.removeStatesWhenErrorOccurredDuringRendering();
  }
}
