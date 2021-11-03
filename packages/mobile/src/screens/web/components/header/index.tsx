import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/stack";
import { useStyle } from "../../../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWebViewState } from "../context";
import Svg, { Path } from "react-native-svg";
import { RectButton } from "../../../../components/rect-button";

const ArrowLeftIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 32, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M20.5 25l-9-9 9-9"
      />
    </Svg>
  );
};

const ArrowRightIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 32, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M11.5 7l9 9-9 9"
      />
    </Svg>
  );
};

const RefreshIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 32, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.5"
        d="M26.457 16.096c0 5.759-4.669 10.428-10.428 10.428-5.76 0-10.429-4.669-10.429-10.428 0-5.76 4.669-10.429 10.429-10.429 2.999 0 5.702 1.266 7.605 3.293"
      />
      <Path fill={color} d="M25.838 11.684l-7.684-.975L25.748 4l.09 7.684z" />
    </Svg>
  );
};

export const OnScreenWebpageScreenHeader: FunctionComponent = () => {
  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const webViewState = useWebViewState();

  return (
    <View
      style={StyleSheet.flatten([
        { width: "100%", height: headerHeight, paddingTop: safeAreaInsets.top },
        style.flatten(["background-color-white", "flex-row", "items-center"]),
      ])}
    >
      <RectButton
        style={style.flatten(["border-radius-8", "margin-left-20"])}
        onPress={() => {
          if (webViewState.webView) {
            webViewState.webView.goBack();
          }
        }}
      >
        <ArrowLeftIcon size={32} color={style.get("color-primary").color} />
      </RectButton>
      <RectButton
        style={style.flatten(["border-radius-8", "margin-left-16"])}
        onPress={() => {
          if (webViewState.webView) {
            webViewState.webView.goForward();
          }
        }}
      >
        <ArrowRightIcon size={32} color={style.get("color-primary").color} />
      </RectButton>

      <View style={style.get("flex-1")} />
      <RectButton
        style={style.flatten(["border-radius-8", "margin-right-20"])}
        onPress={() => {
          if (webViewState.webView) {
            webViewState.webView.reload();
          }
        }}
      >
        <RefreshIcon size={32} color={style.get("color-primary").color} />
      </RectButton>
    </View>
  );
};
