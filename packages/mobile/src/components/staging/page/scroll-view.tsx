import React, { FunctionComponent } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { usePageRegisterScrollYValue, useSetFocusedScreen } from "./utils";

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView
);

export const PageWithScrollView: FunctionComponent<
  ScrollViewProps & {
    fixed?: React.ReactNode;
  }
> = (props) => {
  const style = useStyle();

  useSetFocusedScreen();
  const scrollY = usePageRegisterScrollYValue();

  const { style: propStyle, fixed, onScroll, ...restProps } = props;

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
        <AnimatedKeyboardAwareScrollView
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
        <View
          style={style.flatten(["absolute", "width-full", "height-full"])}
          pointerEvents="box-none"
        >
          {fixed}
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};
