import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PageWithView } from "../../components/page";
import { Platform, Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useStyle } from "../../styles";
import { Keplr } from "@keplr-wallet/provider";
import { RNMessageRequesterInternal } from "../../router";
import { RNInjectedKeplr } from "../../injected/injected-provider";
import RNFS from "react-native-fs";
import EventEmitter from "eventemitter3";

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

export const WebScreen: FunctionComponent = () => {
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

  const sourceCode = useInjectedSourceCode();

  return (
    <PageWithView style={style.flatten(["padding-0"])}>
      <Text>test</Text>
      {sourceCode ? (
        <WebView
          ref={webviewRef}
          source={{ uri: "https://wallet.keplr.app" }}
          injectedJavaScript={sourceCode}
          onMessage={onMessage}
        />
      ) : null}
    </PageWithView>
  );
};
