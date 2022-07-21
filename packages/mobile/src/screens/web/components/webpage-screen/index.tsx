import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BackHandler, Platform } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useStyle } from "../../../../styles";
import { Keplr } from "@keplr-wallet/provider";
import { RNMessageRequesterExternal } from "../../../../router";
import { RNInjectedKeplr } from "../../../../injected/injected-provider";
import RNFS from "react-native-fs";
import EventEmitter from "eventemitter3";
import { PageWithViewInBottomTabView } from "../../../../components/page";
import { OnScreenWebpageScreenHeader } from "../header";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { WebViewStateContext } from "../context";
import { URL } from "react-native-url-polyfill";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { AppCurrency, ChainInfo, KeplrMode } from "@keplr-wallet/types";
import { MessageRequester } from "@keplr-wallet/router";
import { autorun } from "mobx";
import { Mutable } from "utility-types";

// Due to the limitations of the current structure, it is not possible to approve the suggest chain and immediately reflect the updated chain infos.
// Since chain infos cannot be reflected immediately, a problem may occur if a request comes in during that delay.
// To solve this problem, logic is needed to wait until new chain infos are reflected after the suggest chain.
// It's not an graceful solution. However, since it is a structural problem, we choose a solution that can solve it right away.
// TODO: Solve this problem by structural way and remove the class below.
class SuggestChainReceiverKeplr extends Keplr {
  constructor(
    version: string,
    mode: KeplrMode,
    requester: MessageRequester,
    protected readonly suggestChainReceiver: (
      chainInfo: ChainInfo
    ) => Promise<void> | void
  ) {
    super(version, mode, requester);
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    // deep copy
    const mutableChainInfo = JSON.parse(
      JSON.stringify(chainInfo)
    ) as Mutable<ChainInfo>;

    mutableChainInfo.currencies = mutableChainInfo.currencies.map((cur) => {
      const mutableCur = cur as Mutable<AppCurrency>;
      // Although the coinImageUrl field exists in currency, displaying an icon through it is not yet standardized enough.
      // And even in dApps themselves, there are many cases where this field is set incorrectly because it is not yet used by the app itself.
      // For this reason, disable it for a moment.
      // coinGeckoId is also disabled because it is often set incorrectly in dApp.
      delete mutableCur.coinImageUrl;
      delete mutableCur.coinGeckoId;
      return mutableCur;
    });

    await super.experimentalSuggestChain(mutableChainInfo);
    await this.suggestChainReceiver(mutableChainInfo);
  }
}

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    if (Platform.OS === "ios") {
      RNFS.readFile(
        `${RNFS.MainBundlePath}/injected-provider.bundle.js`
      ).then((r) => setCode(r));
    } else {
      RNFS.readFileAssets("injected-provider.bundle.js").then((r) =>
        setCode(r)
      );
    }
  }, []);

  return code;
};

export const WebpageScreen: FunctionComponent<
  React.ComponentProps<typeof WebView> & {
    name: string;
    experimentalOptions?: Partial<{
      enableSuggestChain: boolean;
    }>;
  }
> = observer((props) => {
  const { chainStore, chainSuggestStore, keyRingStore } = useStore();

  const style = useStyle();

  const webviewRef = useRef<WebView | null>(null);
  const [currentURL, setCurrentURL] = useState(() => {
    if (props.source && "uri" in props.source) {
      return props.source.uri;
    }

    return "";
  });

  // XXX: Support for suggest chains experimentally.
  //      However, due to structural problems, it will not work properly if multiple `WebpageScreen` components exist at the same time.
  //      However, due to the current UI design, multiple `WebpageScreen` components cannot exist at the same time.
  //      Therefore, for now, we will postpone the solution of this issue.
  const waitingSuggestedChainInfo = chainSuggestStore.waitingSuggestedChainInfo;
  const enableSuggestChain = !!props.experimentalOptions?.enableSuggestChain;
  useEffect(() => {
    if (waitingSuggestedChainInfo) {
      if (enableSuggestChain) {
        chainSuggestStore.approve();
      } else {
        chainSuggestStore.reject();
      }
    }
  }, [chainSuggestStore, enableSuggestChain, waitingSuggestedChainInfo]);

  // TODO: Set the version properly.
  const [keplr] = useState(
    () =>
      new SuggestChainReceiverKeplr(
        "0.10.10",
        "core",
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error("Webview not initialized yet");
          }

          if (!currentURL) {
            throw new Error("Current URL is empty");
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin,
          };
        }),
        // Check the comments on `SuggestChainReceiverKeplr`
        async (chainInfo) => {
          if (chainStore.hasChain(chainInfo.chainId)) {
            return;
          }

          return new Promise<void>((resolve) => {
            const disposer = autorun(() => {
              if (chainStore.hasChain(chainInfo.chainId)) {
                resolve();

                if (disposer) {
                  disposer();
                }
              } else {
                chainStore.getChainInfosFromBackground();
              }
            });
          });
        }
      )
  );

  const [eventEmitter] = useState(() => new EventEmitter());
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit("message", event.nativeEvent);
    },
    [eventEmitter]
  );

  useEffect(() => {
    RNInjectedKeplr.startProxy(
      keplr,
      {
        addMessageListener: (fn) => {
          eventEmitter.addListener("message", fn);
        },
        postMessage: (message) => {
          webviewRef.current?.injectJavaScript(
            `
                window.postMessage(${JSON.stringify(
                  message
                )}, window.location.origin);
                true; // note: this is required, or you'll sometimes get silent failures
              `
          );
        },
      },
      RNInjectedKeplr.parseWebviewMessage
    );
  }, [eventEmitter, keplr]);

  useEffect(() => {
    const keyStoreChangedListener = () => {
      webviewRef.current?.injectJavaScript(
        `
            window.dispatchEvent(new Event("keplr_keystorechange"));
            true; // note: this is required, or you'll sometimes get silent failures
          `
      );
    };

    keyRingStore.addKeyStoreChangedListener(keyStoreChangedListener);

    return () => {
      keyRingStore.removeKeyStoreChangedListener(keyStoreChangedListener);
    };
  }, [keyRingStore]);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const isFocused = useIsFocused();
  useEffect(() => {
    // Handle the hardware back button on the android.
    const backHandler = () => {
      if (!isFocused || webviewRef.current == null) {
        return false;
      }

      if (!canGoBack) {
        return false;
      }

      webviewRef.current.goBack();
      return true;
    };

    if (isFocused) {
      BackHandler.addEventListener("hardwareBackPress", backHandler);
    }

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backHandler);
    };
  }, [canGoBack, isFocused]);

  const navigation = useNavigation();

  useEffect(() => {
    // Android disables the gesture by default.
    // If we turn on the gesture manually without checking OS,
    // the gesture will turn on even on Android.
    // So, checking platform is required.
    if (Platform.OS === "ios") {
      navigation.setOptions({
        gestureEnabled: !canGoBack,
      });
    }
  }, [canGoBack, navigation]);

  const sourceCode = useInjectedSourceCode();

  const { name, forceDarkOn, ...restProps } = props;

  return (
    <PageWithViewInBottomTabView
      backgroundMode={null}
      style={style.flatten(["padding-0"])}
    >
      <WebViewStateContext.Provider
        value={{
          webView: webviewRef.current,
          name: name,
          url: currentURL,
          canGoBack,
          canGoForward,
        }}
      >
        <OnScreenWebpageScreenHeader />
      </WebViewStateContext.Provider>
      {sourceCode ? (
        <WebView
          ref={webviewRef}
          style={style.flatten([
            "background-color-white",
            "dark:background-color-black",
          ])}
          injectedJavaScriptBeforeContentLoaded={sourceCode}
          onMessage={onMessage}
          onNavigationStateChange={(e) => {
            // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
            // Use two handlers to measure simultaneously in ios and android.
            setCanGoBack(e.canGoBack);
            setCanGoForward(e.canGoForward);

            setCurrentURL(e.url);
          }}
          onLoadProgress={(e) => {
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
          forceDarkOn={(() => {
            if (Platform.OS === "android") {
              return style.theme === "dark" || forceDarkOn;
            }
            return forceDarkOn;
          })()}
          {...restProps}
        />
      ) : null}
    </PageWithViewInBottomTabView>
  );
});

export * from "./screen-options";
