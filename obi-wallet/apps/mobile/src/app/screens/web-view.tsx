import React, { Component } from "react";
import { WebView as GenericWebView } from "react-native-webview";

export function WebView() {
  return <GenericWebView source={{ uri: "https://reactnative.dev/" }} />;
}
