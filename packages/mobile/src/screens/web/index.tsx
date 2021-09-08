import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { PageWithView } from "../../components/page";
import { Platform, Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useStyle } from "../../styles";
import { Keplr } from "@keplr-wallet/provider";
import { RNMessageRequesterInternal } from "../../router";
import { RNInjectedKeplr } from "../../injected/injected-provider";
import RNFS from "react-native-fs";

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
    () => new Keplr("0.0.1", new RNMessageRequesterInternal())
  );
  const [messageHandler] = useState(() =>
    RNInjectedKeplr.onMessageHandler(keplr)
  );

  const sourceCode = useInjectedSourceCode();

  const webviewRef = useRef<WebView | null>(null);

  const onMessage = async (event: WebViewMessageEvent) => {
    const response = await messageHandler(event.nativeEvent.data);
    // TODO: How to handle the target origin?
    webviewRef.current?.injectJavaScript(
      `
      window.postMessage(\`${JSON.stringify(response)}\`, "*");
      true; // note: this is required, or you'll sometimes get silent failures
      `
    );
  };

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
