import React, { FunctionComponent } from "react";
import {
  Header,
  StackHeaderProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { usePageScrollPosition } from "../../providers/page-scroll-position";
import { useRoute } from "@react-navigation/native";
import { HeaderLeftBackButton } from "./button";
import { useStyle } from "../../styles";

export const BlurredHeaderScreenOptionsPreset = {
  headerTitleAlign: "center" as "left" | "center",
  headerStyle: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  headerBackground: undefined,
  headerBackTitleVisible: false,
  // eslint-disable-next-line react/display-name
  header: (props: any) => {
    return <BlurredHeader {...props} />;
  },
  headerLeftContainerStyle: {
    marginLeft: 10,
  },
  headerRightContainerStyle: {
    marginRight: 10,
  },
  // eslint-disable-next-line react/display-name
  headerLeft: (props: any) => <HeaderLeftBackButton {...props} />,
  ...TransitionPresets.SlideFromRightIOS,
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const BlurredHeader: FunctionComponent<StackHeaderProps> = (props) => {
  if (Platform.OS !== "ios") {
    return <AndroidAlternativeBlurredHeader {...props} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const style = useStyle();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const route = useRoute();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pageScrollPosition = usePageScrollPosition();

  const scrollY =
    pageScrollPosition.getScrollYValueOf(route.key) ?? new Animated.Value(0);

  return (
    <AnimatedBlurView
      blurType={style.get("blurred-header-blur-type")}
      blurAmount={scrollY.interpolate({
        inputRange: [0, 35],
        outputRange: [0, style.get("blurred-header-blur-amount")],
        extrapolate: "clamp",
      })}
      reducedTransparencyFallbackColor={style.get(
        "blurred-header-reducedTransparencyFallbackColor"
      )}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: style.get("color-blurred-header-background").color,
          opacity: scrollY.interpolate({
            inputRange: [0, 35],
            outputRange: [1, 0.65],
            extrapolate: "clamp",
          }),
        }}
      />
      <Header {...props} />
    </AnimatedBlurView>
  );
};

const AndroidAlternativeBlurredHeader: FunctionComponent<StackHeaderProps> = (
  props
) => {
  const style = useStyle();

  return (
    <View>
      <View
        style={StyleSheet.flatten([
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: style.get("color-blurred-header-background").color,
            borderBottomWidth: 0.5,
          },
          style.flatten(["border-color-border-white"]),
        ])}
      />
      <Header {...props} />
    </View>
  );
};
