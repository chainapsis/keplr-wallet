import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {WebViewStateContext} from './context';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {RouteProp, useRoute} from '@react-navigation/native';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import EventEmitter from 'eventemitter3';
import {RNInjectedKeplr} from '../../injected/injected-provider';
import {useStore} from '../../stores';
import {Keplr} from '@keplr-wallet/provider';
import {RNMessageRequesterExternal} from '../../router';
import {OnScreenWebpageScreenHeader} from './components/header';
import {Gutter} from '../../components/gutter';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../../navigation';
import DeviceInfo from 'react-native-device-info';

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      RNFS.readFile(`${RNFS.MainBundlePath}/injected-provider.bundle.js`).then(
        r => setCode(r),
      );
    } else {
      RNFS.readFileAssets('injected-provider.bundle.js').then(r => setCode(r));
    }
  }, []);

  return code;
};

export const WebpageScreen: FunctionComponent = observer(() => {
  const {chainStore} = useStore();

  const webviewRef = useRef<WebView | null>(null);
  const route = useRoute<RouteProp<RootStackParamList, 'Web'>>();
  const insect = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const sourceCode = useInjectedSourceCode();

  const uri =
    route.params.url.startsWith('http://') ||
    route.params.url.startsWith('https://')
      ? route.params.url
      : `https://${route.params.url}`;
  const {isExternal} = route.params;

  const [currentURL, setCurrentURL] = useState(uri);

  const [eventEmitter] = useState(() => new EventEmitter());
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit('message', event.nativeEvent);
    },
    [eventEmitter],
  );

  useEffect(() => {
    RNInjectedKeplr.startProxy(
      new Keplr(
        '0.12.20',
        'core',
        new RNMessageRequesterExternal(() => {
          return {
            url: uri,
            origin: new URL(uri).origin,
          };
        }),
      ),
      {
        addMessageListener: fn => {
          eventEmitter.addListener('message', fn);
        },
        postMessage: message => {
          webviewRef.current?.injectJavaScript(
            `
                window.postMessage(${JSON.stringify(
                  message,
                )}, window.location.origin);
                true; // note: this is required, or you'll sometimes get silent failures
              `,
          );
        },
      },
      RNInjectedKeplr.parseWebviewMessage,
    );
  }, [chainStore, eventEmitter, uri]);

  return (
    <React.Fragment>
      <WebViewStateContext.Provider
        value={{
          webView: webviewRef.current,
          name: title,
          url: currentURL,
          canGoBack,
          canGoForward,
        }}>
        <OnScreenWebpageScreenHeader />
      </WebViewStateContext.Provider>
      {sourceCode ? (
        <WebView
          source={{uri}}
          ref={webviewRef}
          applicationNameForUserAgent={`KeplrWalletMobile/${DeviceInfo.getVersion()}`}
          injectedJavaScriptBeforeContentLoaded={sourceCode}
          onMessage={onMessage}
          onNavigationStateChange={e => {
            // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
            // Use two handlers to measure simultaneously in ios and android.
            setCanGoBack(e.canGoBack);
            setCanGoForward(e.canGoForward);

            setCurrentURL(e.url);
          }}
          onLoadProgress={e => {
            // Strangely, `onLoadProgress` is only invoked whenever page changed only in Android.
            // Use two handlers to measure simultaneously in ios and android.
            setCanGoBack(e.nativeEvent.canGoBack);
            setCanGoForward(e.nativeEvent.canGoForward);

            setCurrentURL(e.nativeEvent.url);
          }}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          decelerationRate="normal"
          allowsBackForwardNavigationGestures={true}
          onLoad={event => {
            setTitle(event.nativeEvent.title);
          }}
        />
      ) : null}
      {isExternal ? <Gutter size={insect.bottom} /> : null}
    </React.Fragment>
  );
});
