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
import {BackHandler, PermissionsAndroid, Platform, Text} from 'react-native';
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
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'rn-fetch-blob';
import {registerModal} from '../../components/modal/v2';
import {useStyle} from '../../styles';
import {Box} from '../../components/box';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Columns} from '../../components/column';
import {Button} from '../../components/button';
import {useNotification} from '../../hooks/notification';
import {FormattedMessage, useIntl} from 'react-intl';

const blockListURL = 'https://blocklist.keplr.app';

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

async function hasAndroidPermission() {
  const getCheckPermissionPromise = () => {
    if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
      return Promise.all([
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS['READ_MEDIA_IMAGES'],
        ),
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS['READ_MEDIA_VIDEO'],
        ),
      ]).then(
        ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
          hasReadMediaImagesPermission && hasReadMediaVideoPermission,
      );
    } else {
      return PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS['READ_EXTERNAL_STORAGE'],
      );
    }
  };

  const hasPermission = await getCheckPermissionPromise();
  if (hasPermission) {
    return true;
  }
  const getRequestPermissionPromise = () => {
    if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS['READ_MEDIA_IMAGES'],
        PermissionsAndroid.PERMISSIONS['READ_MEDIA_VIDEO'],
      ]).then(
        statuses =>
          statuses[PermissionsAndroid.PERMISSIONS['READ_MEDIA_IMAGES']] ===
            PermissionsAndroid.RESULTS['GRANTED'] &&
          statuses[PermissionsAndroid.PERMISSIONS['READ_MEDIA_VIDEO']] ===
            PermissionsAndroid.RESULTS['GRANTED'],
      );
    } else {
      return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['READ_EXTERNAL_STORAGE'],
      ).then(status => status === PermissionsAndroid.RESULTS['GRANTED']);
    }
  };

  return await getRequestPermissionPromise();
}

const imageLongPressScript = `
  // used to call "setLongPressOnImg" function again when the page changes
  (() => {
    var oldHref = document.location.href;
    var bodyList = document.querySelector("body")
    var observer = new MutationObserver(function(mutations) {
        if (oldHref != document.location.href) {
            oldHref = document.location.href;
            setTimeout(() => setLongPressOnImg(), 500);
        }
    });
    
    var config = {
        childList: true,
        subtree: true
    };
    
    observer.observe(bodyList, config);
  })()
  
  // long press on image to download
  function setLongPressOnImg() {
    var longPressDuration = 1000;
    var imgItems = document.getElementsByTagName("img");
   
    for (var i = 0, j = imgItems.length; i < j; i++) {
      var node = imgItems[i];
      var longPress = false;
      var pressTimer = null;
      var longTarget = null;
     
      var cancel = function (e) {
        if (pressTimer !== null) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
        this.classList.remove("longPress");
      };
   
      var click = function (e) {
        if (pressTimer !== null) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
   
        this.classList.remove("longPress");
   
        if (longPress) {
          return false;
        }
      };
     
      var start = function (e) {
        if (e.type === "click" && e.button !== 0) {
          return;
        }
   
        longPress = false;
   
        this.classList.add("longPress");
   
        if (pressTimer === null) {
          pressTimer = setTimeout(function () {
            var url = e.target.getAttribute("src");
            if (
              url &&
              url != "" &&
              url.startsWith("http")
            ) {
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({message: "download-image", origin: url}));
              }
            }
   
            longPress = true;
          }, longPressDuration);
        }
   
        return false;
      };
     
      node.addEventListener("mousedown", start);
      node.addEventListener("touchstart", start);
      node.addEventListener("click", click);
      node.addEventListener("mouseout", cancel);
      node.addEventListener("touchend", cancel);
      node.addEventListener("touchleave", cancel);
      node.addEventListener("touchcancel", cancel);
    }
  };
  
  // call the function after 1 second to make sure the page is fully loaded
  setTimeout(() => setLongPressOnImg(), 1000);
`;

export const WebpageScreen: FunctionComponent = observer(() => {
  const {chainStore} = useStore();

  const intl = useIntl();
  const webviewRef = useRef<WebView | null>(null);
  const route = useRoute<RouteProp<RootStackParamList, 'Web'>>();
  const insect = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSaveImageModalOpen, setIsSaveImageModalOpen] = useState(false);
  const [imageData, setImageData] = useState('');
  const notification = useNotification();

  // NOTE: This is used to prevent the script from being injected multiple times.
  const wasLoaded = useRef(false);
  const handleWebViewLoaded = useCallback(async () => {
    if (!wasLoaded.current) {
      wasLoaded.current = true;
      webviewRef?.current?.injectJavaScript(imageLongPressScript);
    }
  }, []);

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
    async (event: WebViewMessageEvent) => {
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

      if (data.message === 'download-image') {
        setImageData(data.origin);
        setIsSaveImageModalOpen(true);
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
      const _blocklistURL = new URL(blockListURL);
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
                setUri(`${blockListURL}?origin=${encodeURIComponent(origin)}`);
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
          onLoadEnd={async () => {
            await handleWebViewLoaded();
          }}
        />
      ) : null}
      {isExternal ? <Gutter size={insect.bottom} /> : null}

      <SaveImageModal
        isOpen={isSaveImageModalOpen}
        setIsOpen={setIsSaveImageModalOpen}
        saveImage={async () => {
          try {
            let imageTag = imageData;

            if (Platform.OS === 'android') {
              if (await hasAndroidPermission()) {
                const res = await RNFetchBlob.config({
                  appendExt: 'png',
                }).fetch('GET', imageData);

                const dirs = RNFetchBlob.fs.dirs.DCIMDir;
                const downloadDest = `${dirs}/${
                  Math.random() * 10000000 ?? 0
                }.png`;

                await RNFetchBlob.fs.writeFile(
                  downloadDest,
                  res.base64(),
                  'base64',
                );

                imageTag = downloadDest;
              }
            }

            await CameraRoll.saveAsset(imageTag, {type: 'photo'});
            notification.show(
              'success',
              intl.formatMessage({id: 'save-image-modal.save-success'}),
            );
          } catch (e) {
            console.log('error', e);
          } finally {
            setIsSaveImageModalOpen(false);
          }
        }}
      />
    </React.Fragment>
  );
});

export const SaveImageModal = registerModal<{
  setIsOpen: (isOpen: boolean) => void;
  saveImage: () => void;
}>(
  observer(({setIsOpen, saveImage}) => {
    const intl = useIntl();
    const style = useStyle();
    return (
      <Box padding={12}>
        <TouchableWithoutFeedback onPress={saveImage}>
          <Box
            height={68}
            borderRadius={8}
            alignX="center"
            alignY="center"
            style={style.flatten([
              'background-color-gray-600',
              'border-color-gray-500',
            ])}>
            <Columns sum={1} alignY="center" gutter={8}>
              <Text
                numberOfLines={1}
                style={style.flatten(['body1', 'color-text-high'])}>
                <FormattedMessage id="save-image-modal.save-image-item" />
              </Text>
            </Columns>
          </Box>
        </TouchableWithoutFeedback>

        <Gutter size={12} />

        <Button
          text={intl.formatMessage({id: 'button.cancel'})}
          size="large"
          color="secondary"
          onPress={() => setIsOpen(false)}
        />
      </Box>
    );
  }),
);
