import {RNInjectedKeplr} from './injected-provider';
import {injectKeplrToWindow} from '@keplr-wallet/provider';

// TODO: Set the Keplr version properly
const keplr = new RNInjectedKeplr('0.10.10', 'mobile-web');
injectKeplrToWindow(keplr);

window.addEventListener(
  'message',
  (e: {data: {type: string; origin: string}}) => {
    if (e.data.type !== 'allow-temp-blocklist-url') {
      return;
    }

    // @ts-ignore
    if (window.ReactNativeWebView) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          message: e.data.type,
          origin: e.data.origin,
        }),
      );
    }
  },
);
