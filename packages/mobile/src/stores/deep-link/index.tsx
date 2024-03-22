import {AppState, Linking} from 'react-native';
import {action, makeObservable, observable} from 'mobx';
import {WalletConnectStore} from '../wallet-connect';

export class DeepLinkStore {
  /*
   XXX: Fairly hacky part.
        In Android, it seems posible that JS works, but all views deleted.
        This case seems to happen when the window size of the app is forcibly changed or the app is exited.
        But there doesn't seem to be an API that can detect this.
        The reason this is a problem is that the stores are all built with a singleton concept.
        Even if the view is initialized and recreated, this store is not recreated.
        In this case, the url handler of the deep link does not work and must be called through initialURL().
        To solve this problem, we leave the detection of the activity state to another component.
        If a component that cannot be unmounted is unmounted, it means the activity is killed.
   */
  protected _isAndroidActivityKilled = false;

  constructor(protected readonly walletConnectStore: WalletConnectStore) {
    makeObservable(this);

    this.init();
  }

  protected async init() {
    await this.checkInitialURL();

    Linking.addEventListener('url', event => {
      this.processDeepLinkURL(event.url);
    });

    AppState.addEventListener('change', state => {
      if (state === 'active') {
        if (this._isAndroidActivityKilled) {
          // If the android activity restored, the deep link url handler will not work.
          // We should recheck the initial URL()
          this.checkInitialURL();
        }
        this._isAndroidActivityKilled = false;
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
        // Todo: Implement the staking deep link handler.
      }
    } catch (e) {
      console.log(e);
    }
  }
}
