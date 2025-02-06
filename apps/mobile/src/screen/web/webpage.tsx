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
import {BackHandler, Linking, Platform, Text} from 'react-native';
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
import {FormattedMessage, useIntl} from 'react-intl';
import {useNotification} from '../../hooks/notification';
import RNFetchBlob from 'rn-fetch-blob';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {Button} from '../../components/button';
import {Columns} from '../../components/column';
import {Box} from '../../components/box';
import {useStyle} from '../../styles';
import {registerModal} from '../../components/modal/v2';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

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

const imageLongPressScript = `
  let longPress = false;
  let pressTimer = null;
  let longTarget = null;
  const longPressDuration = 1000;
  
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

  var el = document.querySelector("body");
  
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if(mutation.target.tagName === "IMG") {
        mutation.target.addEventListener("mousedown", start);
        mutation.target.addEventListener("touchstart", start);
        mutation.target.addEventListener("click", click);
        mutation.target.addEventListener("mouseout", cancel);
        mutation.target.addEventListener("touchend", cancel);
        mutation.target.addEventListener("touchleave", cancel);
        mutation.target.addEventListener("touchcancel", cancel);
      }
    });
  });
  
  observer.observe(el, {
    childList: true,
    subtree: true,
    attributes: true
  });
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
          injectedJavaScript={imageLongPressScript}
          onMessage={onMessage}
          onNavigationStateChange={(e: any) => {
            // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
            // Use two handlers to measure simultaneously in ios and android.
            setCanGoBack(e.canGoBack);
            setCanGoForward(e.canGoForward);

            setCurrentURL(e.url);
            recentUrl.current = e.url;

            checkURLIsPhishing(e.url);
          }}
          onLoadProgress={(e: any) => {
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
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          onLoad={(event: any) => {
            setTitle(event.nativeEvent.title);
          }}
        />
      ) : null}
      {isExternal ? <Gutter size={insect.bottom} /> : null}

      <SaveImageModal
        isOpen={isSaveImageModalOpen}
        setIsOpen={setIsSaveImageModalOpen}
        saveImage={async () => {
          try {
            //이미지의 content-type을 확인하여 jpeg, png만 저장 가능하도록 함
            const imageFetchResponse = await fetch(imageData);
            if (imageFetchResponse.ok) {
              const contentType =
                imageFetchResponse.headers.get('content-type');

              let imageExtension: string | undefined;

              if (contentType === 'image/jpeg') {
                imageExtension = 'jpeg';
              }

              if (contentType === 'image/png') {
                imageExtension = 'png';
              }

              if (!imageExtension) {
                throw new Error('Invalid image extension');
              }

              //이미지를 저장할 경로를 설정
              const downloadDest = `${
                Platform.OS === 'ios'
                  ? RNFS.LibraryDirectoryPath
                  : RNFetchBlob.fs.dirs.DCIMDir
              }/${Math.floor(
                Math.random() * 10000,
              )}${new Date().getTime()}.${imageExtension}`;

              /* iOS에서 이미지를 저장하려고 할 때 Error: The operation couldn’t be completed. (PHPhotosErrorDomain error -1.) 에러가 발생합니다.
                 먼저 이미지를 다운받고 저장하면 에러가 발생하지 않습니다. 아래 이슈를 참고 했습니다.
                 https://github.com/react-native-cameraroll/react-native-cameraroll/issues/186
               */
              const downloadResponse = await RNFS.downloadFile({
                fromUrl: imageData,
                toFile: downloadDest,
              }).promise;

              if (downloadResponse.statusCode === 200) {
                await CameraRoll.saveAsset(downloadDest, {type: 'photo'});
              }
            }

            notification.show(
              'success',
              intl.formatMessage({id: 'save-image-modal.save-success'}),
            );
          } catch (e) {
            console.log('error', e);

            /* iOS에서 Photo Permission 중에 Keep Add Only 옵션을 선택했을 때
               await CameraRoll.saveAsset() 함수를 실행하면 사진은 저장이 되는데 에러가 발생합니다.
               ref: https://github.com/react-native-cameraroll/react-native-cameraroll/issues/617
             */
            if (e.message === 'Unknown error from a native module') {
              notification.show(
                'success',
                intl.formatMessage({id: 'save-image-modal.save-success'}),
              );
            }

            // iOS에서 권한이 없을 때 설정 페이지로 이동
            if (e.message === 'Access to photo library was denied') {
              await Linking.openSettings();
            }
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
