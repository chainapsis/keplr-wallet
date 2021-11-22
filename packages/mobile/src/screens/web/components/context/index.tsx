import React, { useContext } from "react";
import WebView from "react-native-webview";

export interface WebViewState {
  webView: WebView | null;
  name: string;
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const WebViewStateContext = React.createContext<WebViewState | null>(
  null
);

export const useWebViewState = () => {
  const context = useContext(WebViewStateContext);
  if (!context) {
    throw new Error("You forgot to use WebViewStateContext");
  }
  return context;
};
