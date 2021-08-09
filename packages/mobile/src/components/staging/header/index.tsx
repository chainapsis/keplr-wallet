import React, { FunctionComponent } from "react";
import { Header, StackHeaderProps } from "@react-navigation/stack";
import { Platform, View } from "react-native";
import { BlurView } from "@react-native-community/blur";
import { usePageScrollPosition } from "../../../providers/page-scroll-position";

export const BlurredHeader: FunctionComponent<StackHeaderProps> = (props) => {
  if (Platform.OS !== "ios") {
    return <Header {...props} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pageScrollPosition = usePageScrollPosition();

  const opacity = (() => {
    if (!pageScrollPosition.scrollY || pageScrollPosition.scrollY < 0) {
      return 1;
    }
    return 1 - Math.min(pageScrollPosition.scrollY / 75, 1);
  })();

  return (
    <BlurView
      blurType="light"
      blurAmount={30}
      reducedTransparencyFallbackColor="white"
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          opacity,
        }}
      />
      <Header {...props} />
    </BlurView>
  );
};
