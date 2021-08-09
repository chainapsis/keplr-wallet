import React, { FunctionComponent } from "react";
import { Header, StackHeaderProps } from "@react-navigation/stack";
import { Animated, Platform } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { usePageScrollPosition } from "../../../providers/page-scroll-position";
import { useRoute } from "@react-navigation/native";

export const BlurredHeader: FunctionComponent<StackHeaderProps> = (props) => {
  if (Platform.OS !== "ios") {
    return <Header {...props} />;
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
