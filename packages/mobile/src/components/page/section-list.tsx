import React, { FunctionComponent } from "react";
import {
  Animated,
  SafeAreaView,
  SectionListProps,
  StyleSheet,
  View,
} from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../svg";
import { KeyboardAwareSectionList } from "react-native-keyboard-aware-scroll-view";
import { usePageRegisterScrollYValue, useSetFocusedScreen } from "./utils";

const AnimatedKeyboardAwareSectionList = Animated.createAnimatedComponent(
  KeyboardAwareSectionList
);

export const PageWithSectionList: FunctionComponent<
  SectionListProps<any, any>
> = (props) => {
  const style = useStyle();

  useSetFocusedScreen();
  const scrollY = usePageRegisterScrollYValue();

  const { style: propStyle, onScroll, ...restProps } = props;

  return (
    <React.Fragment>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -100,
          bottom: -100,
        }}
      >
        <GradientBackground />
      </View>
      <SafeAreaView style={style.get("flex-1")}>
        <AnimatedKeyboardAwareSectionList
          style={StyleSheet.flatten([
            style.flatten(["flex-1", "padding-0", "overflow-visible"]),
            propStyle,
          ])}
          keyboardOpeningTime={0}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { useNativeDriver: true, listener: onScroll }
          )}
          {...restProps}
        />
      </SafeAreaView>
    </React.Fragment>
  );
};
