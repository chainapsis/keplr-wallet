import React, { FunctionComponent } from "react";
import {
  Animated,
  Platform,
  SafeAreaView,
  SectionListProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../svg";
import { KeyboardAwareSectionList } from "react-native-keyboard-aware-scroll-view";
import { usePageRegisterScrollYValue, useSetFocusedScreen } from "./utils";

const AnimatedKeyboardAwareSectionList = Animated.createAnimatedComponent(
  KeyboardAwareSectionList
);

export const PageWithSectionList: FunctionComponent<
  SectionListProps<any, any> & {
    containerStyle?: ViewStyle;
  }
> = (props) => {
  const style = useStyle();

  useSetFocusedScreen();
  const scrollY = usePageRegisterScrollYValue();

  const { style: propStyle, onScroll, containerStyle, ...restProps } = props;

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
      <SafeAreaView
        style={StyleSheet.flatten([
          style.flatten(
            ["flex-1"],
            /*
               In android, overflow of container view is hidden by default.
               That's why even if you make overflow visible to the scroll view's style, it will behave like hidden unless you change the overflow property of this container view.
               This is done by the following reasons.
                  - On Android, header or bottom tabbars are opaque by default, so overflow hidden is usually not a problem.
                  - Bug where overflow visible is ignored for unknown reason if ScrollView has RefreshControl .
                  - If the overflow of the container view is not hidden, even if the overflow of the scroll view is hidden, there is a bug that the refresh control created from above still appears outside the scroll view.
               */
            [Platform.OS !== "ios" && "overflow-hidden"]
          ),
          containerStyle,
        ])}
      >
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
