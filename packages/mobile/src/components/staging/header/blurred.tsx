import React, { FunctionComponent } from "react";
import {
  Header,
  StackHeaderProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { Animated, Platform, View } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { usePageScrollPosition } from "../../../providers/page-scroll-position";
import { useRoute } from "@react-navigation/native";
import { HeaderLeftBackButton } from "./button";

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

export const BlurredHeader: FunctionComponent<StackHeaderProps> = (props) => {
  if (Platform.OS !== "ios") {
    return (
      <View>
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
          }}
        />
        <Header {...props} />
      </View>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const route = useRoute();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pageScrollPosition = usePageScrollPosition();

  const scrollY =
    pageScrollPosition.getScrollYValueOf(route.key) ?? new Animated.Value(0);

  return (
    <BlurView
      blurType="light"
      blurAmount={30}
      reducedTransparencyFallbackColor="white"
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          opacity: scrollY.interpolate({
            inputRange: [0, 75],
            outputRange: [1, 0],
            extrapolate: "clamp",
          }),
        }}
      />
      <Header {...props} />
    </BlurView>
  );
};
