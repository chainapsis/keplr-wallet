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
import { RNMessageRequesterInternal } from "../../../../router";
import { RNInjectedKeplr } from "../../../../injected/injected-provider";
import RNFS from "react-native-fs";
import EventEmitter from "eventemitter3";
import { PageWithViewInBottomTabView } from "../../../../components/page/view-in-bottom-tab-view";
import { OnScreenWebpageScreenHeader } from "../header";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { WebViewStateContext } from "../context";

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
  React.ComponentProps<typeof WebView>
> = (props) => {
  const style = useStyle();

  // TODO: Set the version properly.
  // IMPORTANT: Current message requester is for the internal usages.
  //            Don't use it in the production!!
  const [keplr] = useState(
    () => new Keplr("0.0.1", "core", new RNMessageRequesterInternal())
  );

  const [eventEmitter] = useState(() => new EventEmitter());
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit("message", event.nativeEvent);
    },
    [eventEmitter]
  );

  const webviewRef = useRef<WebView | null>(null);

  useEffect(() => {
    RNInjectedKeplr.startProxy(
      keplr,
      {
        addMessageListener: (fn) => {
          eventEmitter.addListener("message", fn);
        },
        postMessage: (message) => {
          webviewRef.current?.postMessage(JSON.stringify(message));
        },
      },
      RNInjectedKeplr.parseWebviewMessage
    );
  }, [eventEmitter, keplr]);

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
    navigation.setOptions({
      gestureEnabled: !canGoBack,
    });
  }, [canGoBack, navigation]);

  const sourceCode = useInjectedSourceCode();

  return (
    <PageWithViewInBottomTabView style={style.flatten(["padding-0"])}>
      <WebViewStateContext.Provider
        value={{
          webView: webviewRef.current,
          canGoBack,
          canGoForward,
        }}
      >
        <OnScreenWebpageScreenHeader />
      </WebViewStateContext.Provider>
      {sourceCode ? (
        <WebView
          ref={webviewRef}
          injectedJavaScript={sourceCode}
          onMessage={onMessage}
          onNavigationStateChange={(e) => {
            // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
            // Use two handlers to measure simultaneously in ios and android.
            setCanGoBack(e.canGoBack);
            setCanGoForward(e.canGoForward);
          }}
          onLoadProgress={(e) => {
            // Strangely, `onLoadProgress` is only invoked whenever page changed only in Android.
            // Use two handlers to measure simultaneously in ios and android.
            setCanGoBack(e.nativeEvent.canGoBack);
            setCanGoForward(e.nativeEvent.canGoForward);
          }}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          decelerationRate="normal"
          allowsBackForwardNavigationGestures={true}
          {...props}
        />
      ) : null}
    </PageWithViewInBottomTabView>
  );
};

export * from "./screen-options";
