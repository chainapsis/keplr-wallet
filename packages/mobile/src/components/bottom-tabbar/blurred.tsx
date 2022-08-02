import React, { FunctionComponent } from "react";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { useFocusedScreen } from "../../providers/focused-screen";
import { useStyle } from "../../styles";

export const BlurredBottomTabBar: FunctionComponent<
  BottomTabBarProps & {
    enabledScreens?: string[];
  }
> = (props) => {
  if (Platform.OS === "android") {
    return <AndroidAlternativeBlurredBottomTabBar {...props} />;
  }

  const { style: propStyle, enabledScreens = [], ...rest } = props;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const style = useStyle();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const focusedScreen = useFocusedScreen();

  const containerOpacity = (() => {
    if (enabledScreens.length === 0) {
      return style.get("opacity-blurred-tabbar").opacity;
    }

    if (focusedScreen.name && enabledScreens.includes(focusedScreen.name)) {
      return style.get("opacity-blurred-tabbar").opacity;
    }

    return 1;
  })();

  return (
    <BlurView
      style={{
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
      blurType={style.get("blurred-tabbar-blur-type")}
      blurAmount={style.get("blurred-tabbar-blur-amount")}
      reducedTransparencyFallbackColor={style.get(
        "blurred-tabbar-reducedTransparencyFallbackColor"
      )}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: style.get("color-blurred-tabbar-background").color,
          opacity: containerOpacity,
        }}
      />
      <BottomTabBar
        // Why type error??
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        style={StyleSheet.flatten([
          propStyle,
          {
            backgroundColor: "#FFFFFF00",
          },
        ])}
        {...rest}
      />
    </BlurView>
  );
};

const AndroidAlternativeBlurredBottomTabBar: FunctionComponent<BottomTabBarProps> = (
  props
) => {
  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
};
