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
} from 'mobx';
import {KVStore} from '@keplr-wallet/common';
import {CoinGeckoPriceStore} from '@keplr-wallet/stores';
import {KeyRingStore} from '@keplr-wallet/stores-core';
import {FiatCurrency} from '@keplr-wallet/types';
import {CopyAddressConfig} from './copy-address';
import {ChainStore} from '../chain';
import {AddressBookConfig} from './address-book';
import {MessageRequester} from '@keplr-wallet/router';
import {AutoLockConfig} from './auto-lock';
import {IBCSwapConfig} from './ibc-swap.ts';
import {SelectWalletConfig} from './select-wallet.ts';

export interface UIConfigOptions {
  isDeveloperMode: boolean;
  hideLowBalance: boolean;
  rememberLastFeeOption: boolean;
  lastFeeOption: 'low' | 'average' | 'high' | false;
  show24HChangesInMagePage: boolean;

  useWebHIDLedger: boolean;
}

export interface LanguageOption {
  language: string;
  isAutomatic: boolean;
}

export class UIConfigStore {
  protected readonly kvStore: KVStore;

  public readonly copyAddressConfig: CopyAddressConfig;
  public readonly addressBookConfig: AddressBookConfig;
  public readonly autoLockConfig: AutoLockConfig;
  public readonly ibcSwapConfig: IBCSwapConfig;
  public readonly selectWalletConfig: SelectWalletConfig;

  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _options: UIConfigOptions = {
    isDeveloperMode: false,
    hideLowBalance: false,
    rememberLastFeeOption: false,
    lastFeeOption: false,
    show24HChangesInMagePage: true,

    useWebHIDLedger: false,
  };

  protected _platform: 'mobile' = 'mobile';

  @observable
  protected _languageOptions: LanguageOption = {
    language: 'en',
    isAutomatic: true,
  };

  // Struct is required for compatibility with recipient config hook
  @observable.struct
  protected _icnsInfo:
    | {
        readonly chainId: string;
        readonly resolverContractAddress: string;
      }
    | undefined = undefined;

  @observable
  protected _fiatCurrency: string = 'usd';

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
    },
  ) {
    this.kvStore = kvStores.kvStore;
    this.copyAddressConfig = new CopyAddressConfig(
      kvStores.kvStore,
      chainStore,
    );
    this.autoLockConfig = new AutoLockConfig(kvStores.kvStore, chainStore);
    this.addressBookConfig = new AddressBookConfig(
      kvStores.addressBookKVStore,
      messageRequester,
      chainStore,
      keyRingStore,
    );
    this.ibcSwapConfig = new IBCSwapConfig(kvStores.kvStore, chainStore);
    this.selectWalletConfig = new SelectWalletConfig(kvStores.kvStore);

    this._icnsInfo = _icnsInfo;

    makeObservable(this);

    this.init();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  protected async init() {
    // Set the last version to the kv store.
    // At present, this is not used at all.
    // For the future, this can be used to show the changelog.
    await this.kvStore.set('lastVersion', 0);

    {
      const saved = await this.kvStore.get<string>('fiatCurrency');
      this.selectFiatCurrency(saved || 'usd');
      autorun(() => {
        this.kvStore.set('fiatCurrency', this._fiatCurrency);
      });
    }

    {
      const saved = await this.kvStore.get<LanguageOption>(
        'app_language_options',
      );
      this.selectLanguageOptions(
        saved?.language ? saved : {language: 'en', isAutomatic: true},
      );
      autorun(() => {
        this.kvStore.set('app_language_options', this._languageOptions);
      });
    }

    {
      const saved = await this.kvStore.get<Partial<UIConfigOptions>>('options');
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
        this.kvStore.set('options', toJS(this._options));
      });
    }

    await Promise.all([
      this.copyAddressConfig.init(),
      this.addressBookConfig.init(),
      this.autoLockConfig.init(),
      this.ibcSwapConfig.init(),
      this.selectWalletConfig.init(),
    ]);

    runInAction(() => {
      this._isInitialized = true;
    });
  }

  get options(): UIConfigOptions {
    return this._options;
  }

  get platform(): 'mobile' {
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
  setRememberLastFeeOption(value: boolean) {
    this.options.rememberLastFeeOption = value;
  }

  get rememberLastFeeOption(): boolean {
    return this.options.rememberLastFeeOption;
  }

  @action
  setLastFeeOption(value: 'low' | 'average' | 'high' | false) {
    this.options.lastFeeOption = value;
  }

  get lastFeeOption(): 'low' | 'average' | 'high' | false {
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
      fiatCurrency = 'usd';
    }

    return {
      ...(this.priceStore.supportedVsCurrencies[fiatCurrency] ?? {
        currency: 'usd',
        symbol: '$',
        maxDecimals: 2,
        locale: 'en-US',
      }),
    };
  }

  @action
  selectFiatCurrency(value: string) {
    this._fiatCurrency = value;
    this.priceStore.setDefaultVsCurrency(value);
  }

  get language(): string {
    return this._languageOptions.language;
  }

  get languageIsAutomatic(): boolean {
    return this._languageOptions.isAutomatic;
  }

  @action
  selectLanguageOptions(value: LanguageOption) {
    this._languageOptions = value;
  }

  get supportedFiatCurrencies() {
    return this.priceStore.supportedVsCurrencies;
  }

  get icnsInfo() {
    return this._icnsInfo;
  }

  async removeStatesWhenErrorOccurredDuringRending() {
    await this.ibcSwapConfig.removeStatesWhenErrorOccurredDuringRendering();
  }
}
