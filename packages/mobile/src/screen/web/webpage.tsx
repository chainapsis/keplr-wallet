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
import {BackHandler, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import EventEmitter from 'eventemitter3';
import {RNInjectedKeplr} from '../../injected/injected-provider';
import {useStore} from '../../stores';
import {Keplr} from '@keplr-wallet/provider';
import {
  RNMessageRequesterExternal,
  RNMessageRequesterInternal,
} from '../../router';
import {OnScreenWebpageScreenHeader} from './components/header';
import {Gutter} from '../../components/gutter';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../../navigation';
import DeviceInfo from 'react-native-device-info';
import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {
  CheckBadTwitterIdMsg,
  CheckURLIsPhishingOnMobileMsg,
  URLTempAllowOnMobileMsg,
} from '@keplr-wallet/background';
import {useConfirm} from '../../hooks/confirm';

const blocklistURL = 'https://blocklist.keplr.app';

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
  const confirm = useConfirm();
  const sourceCode = useInjectedSourceCode();

  const recentUrl = useRef('');

  const [uri, setUri] = useState(
    route.params.url.startsWith('http://') ||
      route.params.url.startsWith('https://')
      ? route.params.url
      : `https://${route.params.url}`,
  );

  const {isExternal} = route.params;

  const [currentURL, setCurrentURL] = useState(uri);

  const [eventEmitter] = useState(() => new EventEmitter());
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit('message', event.nativeEvent);

      const data: {message: string; origin: string} = JSON.parse(
        event.nativeEvent.data,
      );

      if (data.message === 'allow-temp-blocklist-url') {
        try {
          new RNMessageRequesterInternal()
            .sendMessage(
              BACKGROUND_PORT,
              new URLTempAllowOnMobileMsg(
                new URL(uri).href,
                new URL(data.origin).href,
              ),
            )
            .then(() => {
              setUri(data.origin);
            })
            .catch(e => {
              console.log(e);
              // ignore error
            });
        } catch (e) {
          // noop
          console.log(e);
        }
      }
    },
    [eventEmitter, uri],
  );

  useEffect(() => {
    const unlisten = RNInjectedKeplr.startProxy(
      new Keplr(
        '0.12.20',
        'core',
        new RNMessageRequesterExternal(() => {
          //NOTE - 웹뷰 내부에서 페이지 이동을 할경우 해당 url이 window.keplr의 origin과는 동기화가 안됨
          //해서 웹 뷰 내부에서 url 변경시 ref에 저장 후 인터랙션시 사용하도록 함
          //state를 안 쓴이유는 state는 비동기라서 이전 상태값을 가지고 있는 경우가 있어서 ref를 사용함
          const url = (() => {
            return recentUrl.current.startsWith('http://') ||
              recentUrl.current.startsWith('https://')
              ? recentUrl.current
              : uri;
          })();
          return {
            url: url,
            origin: new URL(url).origin,
          };
        }),
      ),
      {
        addMessageListener: fn => {
          eventEmitter.addListener('message', fn);
        },
        removeMessageListener: fn => {
          eventEmitter.removeListener('message', fn);
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

    return () => {
      unlisten();
    };
  }, [chainStore, uri, eventEmitter]);

  const checkURLIsPhishing = (origin: string) => {
    try {
      const _blocklistURL = new URL(blocklistURL);
      const url = new URL(origin);

      if (url.hostname === 'twitter.com' || url.hostname === 'x.com') {
        const paths = url.pathname
          .split('/')
          .map(path => path.trim())
          .filter(path => path.length > 0);

        if (paths.length > 0) {
          let id = paths[0];
          if (id.startsWith('@')) {
            id = id.slice(1);
          }

          new RNMessageRequesterInternal()
            .sendMessage(BACKGROUND_PORT, new CheckBadTwitterIdMsg(id))
            .then(r => {
              if (r) {
                confirm.confirm(
                  '🚨 Phishing Alert',
                  `@${id} has been reported as a phishing account. Do NOT interact with the account, and particularly avoid visiting any links in its tweets.`,
                  {
                    forceYes: true,
                    yesText: 'Understood',
                  },
                );
              }
            })
            .catch(e => {
              console.log("Failed to check domain's reliability", e);
            });
        }

        return;
      }

      if (url.origin !== _blocklistURL.origin) {
        if (url.hostname !== 'localhost') {
          new RNMessageRequesterInternal()
            .sendMessage(
              BACKGROUND_PORT,
              new CheckURLIsPhishingOnMobileMsg(url.href),
            )
            .then(r => {
              if (r) {
                setUri(`${blocklistURL}?origin=${encodeURIComponent(origin)}`);
              }
            })
            .catch(e => {
              console.log("Failed to check domain's reliability", e);
            });
        }
      }
    } catch (e) {
      console.log('Failed to parse url', e);
    }
  };

  useEffect(() => {
    const onPress = () => {
      if (canGoBack) {
        webviewRef.current?.goBack();
        return true;
      } else {
        return false;
      }
    };

    BackHandler.addEventListener('hardwareBackPress', onPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPress);
    };
  }, [canGoBack]);

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
            recentUrl.current = e.url;

            checkURLIsPhishing(e.url);
          }}
          onLoadProgress={e => {
            // Strangely, `onLoadProgress` is only invoked whenever page changed only in Android.
            // Use two handlers to measure simultaneously in ios and android.
            setCanGoBack(e.nativeEvent.canGoBack);
            setCanGoForward(e.nativeEvent.canGoForward);

            setCurrentURL(e.nativeEvent.url);
            recentUrl.current = e.nativeEvent.url;

            checkURLIsPhishing(e.nativeEvent.url);
          }}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          decelerationRate="normal"
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          onLoad={event => {
            setTitle(event.nativeEvent.title);
          }}
        />
      ) : null}
      {isExternal ? <Gutter size={insect.bottom} /> : null}
    </React.Fragment>
  );
});
