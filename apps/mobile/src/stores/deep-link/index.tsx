import {AppState, Linking} from 'react-native';
import {action, makeObservable, observable, runInAction} from 'mobx';
import {WalletConnectStore} from '../wallet-connect';

type DeepLinkRoute =
  | 'Coinbase.Staking.ValidateList'
  | 'Coinbase.ShowAddress'
  | 'Staking.ValidateDetail'
  | 'Web.WebPage';

type DeepLinkParams = {
  route: DeepLinkRoute;
  params: Record<string, string | number | undefined>;
};

export class DeepLinkStore {
  constructor(protected readonly walletConnectStore: WalletConnectStore) {
    makeObservable(this);

    this.init();
  }

  @observable
  protected _needToNavigation: DeepLinkParams | undefined = undefined;

  get needToNavigation(): DeepLinkParams | undefined {
    return this._needToNavigation;
  }

  @action
  clearNeedToNavigation() {
    this._needToNavigation = undefined;
  }

  protected async init() {
    await this.checkInitialURL();

    Linking.addEventListener('url', event => {
      this.processDeepLinkURL(event.url);
    });

    AppState.addEventListener('change', state => {
      if (state === 'active') {
        if (this.walletConnectStore.isAndroidActivityKilled) {
          // If the android activity restored, the deep link url handler will not work.
          // We should recheck the initial URL()
          this.checkInitialURL();
        }
        this.walletConnectStore.setAndroidActivityKilled(false);
      }
    });
  }

  protected async checkInitialURL() {
    const initialURL = await Linking.getInitialURL();
    if (initialURL) {
      await this.processDeepLinkURL(initialURL);
    }
  }

  protected async processDeepLinkURL(_url: string) {
    try {
      const url = new URL(_url);

      if (url.protocol === 'keplrwallet:' && url.host === 'wcV2') {
        await this.walletConnectStore.processDeepLinkURL(url);
      }

      // url.host === 'staking' is from Deeplink keplrwallet://staking?
      // url.host === 'deeplink.keplr.app' is from applink or universal link https://deeplink.keplr.app/staking
      if (
        (url.protocol === 'keplrwallet:' && url.host === 'staking') ||
        (url.host === 'deeplink.keplr.app' && url.pathname === '/staking')
      ) {
        this.processStakingLinkURL(url);
      }

      if (
        (url.protocol === 'keplrwallet:' && url.host === 'web-browser') ||
        (url.host === 'deeplink.keplr.app' && url.pathname === '/web-browser')
      ) {
        this.processWebBrowserLinkURL(url);
      }

      if (
        (url.protocol === 'keplrwallet:' && url.host === 'show-address') ||
        (url.host === 'deeplink.keplr.app' && url.pathname === '/show-address')
      ) {
        this.processShowAddressLinkURL(url);
      }
    } catch (e) {
      console.log(e);
    }
  }

  protected processStakingLinkURL(_url: URL) {
    try {
      // If deep link, uri can be escaped.
      const params = decodeURIComponent(_url.search);
      const urlParams = new URLSearchParams(params);

      if (
        urlParams.has('chainId') &&
        urlParams.has('userIdentifier') &&
        urlParams.has('activityName')
      ) {
        runInAction(() => {
          this._needToNavigation = {
            route: 'Coinbase.Staking.ValidateList',
            params: {
              chainId: urlParams.get('chainId') as string,
              userIdentifier: urlParams.get('userIdentifier') as string,
              activityName: urlParams.get('activityName') as string,
            },
          };
        });
      }

      if (urlParams.has('chainId') && urlParams.has('validatorAddress')) {
        runInAction(() => {
          this._needToNavigation = {
            route: 'Staking.ValidateDetail',
            params: {
              chainId: urlParams.get('chainId') as string,
              validatorAddress: urlParams.get('validatorAddress') as string,
            },
          };
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  protected processWebBrowserLinkURL(_url: URL) {
    try {
      // If deep link, uri can be escaped.
      const params = decodeURIComponent(_url.search);
      const urlParams = new URLSearchParams(params);

      if (urlParams.has('url')) {
        runInAction(() => {
          this._needToNavigation = {
            route: 'Web.WebPage',
            params: {
              url: urlParams.get('url') as string,
            },
          };
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  protected processShowAddressLinkURL(_url: URL) {
    try {
      const params = decodeURIComponent(_url.search);
      const urlParams = new URLSearchParams(params);

      if (urlParams.has('chainId')) {
        runInAction(() => {
          this._needToNavigation = {
            route: 'Coinbase.ShowAddress',
            params: {
              showAddressChainId: urlParams.get('chainId') as string,
            },
          };
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}
