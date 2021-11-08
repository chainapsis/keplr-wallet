import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/stack";
import { useStyle } from "../../../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWebViewState } from "../context";
import Svg, { Path } from "react-native-svg";
import { RectButton } from "../../../../components/rect-button";
import { useSmartNavigation } from "../../../../navigation";
import { URL } from "react-native-url-polyfill";

const ArrowLeftIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 28, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17.938 21.875L10.063 14l7.874-7.875"
      />
    </Svg>
  );
};

const ArrowRightIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 28, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.063 6.125L17.936 14l-7.875 7.875"
      />
    </Svg>
  );
};

const RefreshIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 28, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2"
        d="M23.15 14.083a9.125 9.125 0 11-2.47-6.243"
      />
      <Path fill={color} d="M22.608 10.224l-6.724-.853L22.53 3.5l.078 6.723z" />
    </Svg>
  );
};

const HomeIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 28, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeWidth="2"
        d="M24 14.029v7.547C24 22.915 22.937 24 21.625 24h-2.458a1.5 1.5 0 01-1.5-1.5v-4.963a.8.8 0 00-.792-.808h-4.75a.8.8 0 00-.792.808V22.5a1.5 1.5 0 01-1.5 1.5H7.375C6.063 24 5 22.915 5 21.576V14.03c0-.857.334-1.68.928-2.285L12.82 4.71a2.342 2.342 0 013.358 0l6.894 7.034c.593.606.927 1.428.927 2.285z"
      />
    </Svg>
  );
};

export const OnScreenWebpageScreenHeader: FunctionComponent = () => {
  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const smartNavigation = useSmartNavigation();

  const webViewState = useWebViewState();

  return (
    <View
      style={StyleSheet.flatten([
        {
          width: "100%",
          height: headerHeight,
          paddingTop: safeAreaInsets.top,
        },
        style.flatten(["background-color-white", "flex-row", "items-center"]),
      ])}
    >
      <RectButton
        style={style.flatten(["border-radius-8", "margin-left-20"])}
        onPress={() => {
          if (!webViewState.canGoBack) {
            smartNavigation.goBack();
          } else if (webViewState.webView) {
            webViewState.webView.goBack();
          }
        }}
      >
        <ArrowLeftIcon size={28} color={style.get("color-primary").color} />
      </RectButton>
      <RectButton
        style={style.flatten(["border-radius-8", "margin-left-10"])}
        onPress={() => {
          if (webViewState.webView) {
            webViewState.webView.goForward();
          }
        }}
      >
        <ArrowRightIcon size={28} color={style.get("color-primary").color} />
      </RectButton>

      <View
        style={style.flatten([
          "flex-1",
          "flex-row",
          "items-center",
          "background-color-border-white",
          "border-radius-4",
          "margin-x-16",
          "padding-x-12",
          "height-38",
        ])}
      >
        <Text
          style={style.flatten([
            "flex-1",
            "subtitle1",
            "color-text-black-medium",
          ])}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {(() => {
            try {
              const url = new URL(webViewState.url);
              return `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
            } catch (e) {
              console.log(e);
              return "";
            }
          })()}
        </Text>
        <RectButton
          style={style.flatten(["border-radius-8", "margin-left-4"])}
          onPress={() => {
            if (webViewState.webView) {
              webViewState.webView.reload();
            }
          }}
        >
          <RefreshIcon
            size={28}
            color={style.get("color-text-black-very-very-low").color}
          />
        </RectButton>
      </View>

      <RectButton
        style={style.flatten(["border-radius-8", "margin-right-20"])}
        onPress={() => {
          smartNavigation.navigateSmart("Web.Intro", {});
        }}
      >
        <HomeIcon size={28} color={style.get("color-primary").color} />
      </RectButton>
    </View>
  );
};
