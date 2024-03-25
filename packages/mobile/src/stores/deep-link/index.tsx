import {AppState, Linking} from 'react-native';
import {action, makeObservable, observable, runInAction} from 'mobx';
import {WalletConnectStore} from '../wallet-connect';

type StakingDeepLinkParams = {chainId: string; from?: string};

export class DeepLinkStore {
  constructor(protected readonly walletConnectStore: WalletConnectStore) {
    makeObservable(this);

    this.init();
  }

  @observable
  protected _needToNavigation: StakingDeepLinkParams | undefined = undefined;

  get needToNavigation(): StakingDeepLinkParams | undefined {
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

      if (url.protocol === 'keplrwallet:' && url.host === 'staking') {
        this.processStakingLinkURL(url);
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

      if (urlParams.has('chainId')) {
        if (urlParams.has('from')) {
          console.log(urlParams.get('chainId'), urlParams.get('from'));
          runInAction(() => {
            this._needToNavigation = {
              chainId: urlParams.get('chainId') as string,
              from: urlParams.get('from') as string,
            };
          });
        } else {
          console.log(urlParams.get('chainId'));
          runInAction(() => {
            this._needToNavigation = {
              chainId: urlParams.get('chainId') as string,
              from: urlParams.get('from') as string,
            };
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}
