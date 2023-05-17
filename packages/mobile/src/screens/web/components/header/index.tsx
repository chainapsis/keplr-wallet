import React, { FunctionComponent } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/stack";
import { useStyle } from "../../../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWebViewState } from "../context";
import Svg, { Path } from "react-native-svg";
import { RectButton } from "../../../../components/rect-button";
import { useSmartNavigation } from "../../../../navigation";

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
        strokeWidth="2"
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
        strokeWidth="2"
        d="M11.5 7l9 9-9 9"
      />
    </Svg>
  );
};

const RefreshIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 20, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 20 20">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2"
        d="M16.536 10.06A6.518 6.518 0 1114.77 5.6"
      />
      <Path fill={color} d="M16.149 7.303l-4.803-.61L16.093 2.5l.056 4.803z" />
    </Svg>
  );
};

const HomeIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 32, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        stroke={color}
        strokeWidth="2"
        d="M27.429 16.033v8.626c0 1.53-1.216 2.77-2.715 2.77h-3.023a1.5 1.5 0 01-1.5-1.5v-5.887a.914.914 0 00-.905-.923h-5.429c-.5 0-.905.413-.905.923v5.886a1.5 1.5 0 01-1.5 1.5H8.43c-1.5 0-2.715-1.24-2.715-2.77v-8.625c0-.98.382-1.92 1.06-2.612l7.878-8.038a2.676 2.676 0 013.839 0l7.878 8.038a3.732 3.732 0 011.06 2.612z"
      />
    </Svg>
  );
};

export const OnScreenWebpageScreenHeader: FunctionComponent = () => {
  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeaderHeight = headerHeight - safeAreaInsets.top;

  const smartNavigation = useSmartNavigation();

  const webViewState = useWebViewState();

  return (
    <View
      style={StyleSheet.flatten([
        {
          width: "100%",
          height: headerHeight,
          // If the iPhone has notch, add the extra bottom space for header.
          // Because of the lack of space, it slightly invades the notch, giving it a bit more space.
          paddingTop:
            safeAreaInsets.top -
            (Platform.OS === "ios" && safeAreaInsets.top > 44 ? 6 : 0),
        },
        style.flatten([
          "background-color-white",
          "dark:background-color-platinum-600",
          "flex-row",
          "items-center",
        ]),
      ])}
    >
      <View
        style={StyleSheet.flatten([
          style.flatten(["width-full", "items-center", "justify-center"]),
          {
            height: actualHeaderHeight,
          },
        ])}
      >
        {/* Name and refresh icon on center */}
        <RectButton
          style={style.flatten([
            "flex-row",
            "items-center",
            "border-radius-4",
            "padding-left-12",
            "padding-right-10",
            "padding-y-5",
          ])}
          onPress={() => {
            if (webViewState.webView) {
              webViewState.webView.reload();
            }
          }}
        >
          <Text
            style={style.flatten(["h4", "color-text-middle", "margin-right-8"])}
          >
            {webViewState.name}
          </Text>
          <RefreshIcon
            size={20}
            color={
              style.flatten(["color-gray-200", "dark:color-platinum-300"]).color
            }
          />
        </RectButton>

        {/* Other buttons like the back, forward, home... */}
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "absolute",
              "width-full",
              "flex-row",
              "items-center",
            ]),
            {
              left: 0,
              height: actualHeaderHeight,
            },
          ])}
          pointerEvents="box-none"
        >
          <RectButton
            style={style.flatten([
              "border-radius-4",
              "padding-4",
              "margin-left-20",
            ])}
            rippleColor={
              style.flatten(["color-blue-50", "dark:color-platinum-300"]).color
            }
            onPress={() => {
              if (!webViewState.canGoBack) {
                smartNavigation.goBack();
              } else if (webViewState.webView) {
                webViewState.webView.goBack();
              }
            }}
          >
            <ArrowLeftIcon
              size={32}
              color={
                style.flatten(["color-blue-400", "dark:color-platinum-50"])
                  .color
              }
            />
          </RectButton>
          <RectButton
            style={style.flatten([
              "border-radius-4",
              "padding-4",
              "margin-left-8",
            ])}
            rippleColor={
              style.flatten(["color-blue-50", "dark:color-platinum-300"]).color
            }
            onPress={() => {
              if (webViewState.webView) {
                webViewState.webView.goForward();
              }
            }}
          >
            <ArrowRightIcon
              size={32}
              color={
                style.flatten(["color-blue-400", "dark:color-platinum-50"])
                  .color
              }
            />
          </RectButton>
          <View style={style.get("flex-1")} />
          <RectButton
            style={style.flatten([
              "border-radius-4",
              "padding-4",
              "margin-right-20",
            ])}
            rippleColor={
              style.flatten(["color-blue-50", "dark:color-platinum-300"]).color
            }
            onPress={() => {
              smartNavigation.navigateSmart("Web.Intro", {});
            }}
          >
            <HomeIcon
              size={32}
              color={
                style.flatten(["color-blue-400", "dark:color-platinum-50"])
                  .color
              }
            />
          </RectButton>
        </View>
      </View>
    </View>
  );
};
