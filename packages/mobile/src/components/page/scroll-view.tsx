import React, { forwardRef } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollViewProps,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { usePageRegisterScrollYValue, useSetFocusedScreen } from "./utils";

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView
);

// eslint-disable-next-line react/display-name
export const PageWithScrollView = forwardRef<
  ScrollView,
  React.PropsWithChildren<
    ScrollViewProps & {
      fixed?: React.ReactNode;
      disableSafeArea?: boolean;
      backgroundColor?: string;
    }
  >
>((props, ref) => {
  const style = useStyle();

  useSetFocusedScreen();
  const scrollY = usePageRegisterScrollYValue();

  const {
    style: propStyle,
    fixed,
    onScroll,
    disableSafeArea,
    backgroundColor,
    ...restProps
  } = props;

  const ContainerElement = disableSafeArea ? View : SafeAreaView;

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
        {backgroundColor ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor,
            }}
          />
        ) : (
          <GradientBackground />
        )}
      </View>
      <ContainerElement style={style.get("flex-1")}>
        <AnimatedKeyboardAwareScrollView
          innerRef={(_ref) => {
            if (ref) {
              // I don't know why the _ref's type is JSX.Element
              if (typeof ref === "function") {
                ref(_ref as any);
              } else {
                ref.current = _ref as any;
              }
            }
          }}
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
      </ContainerElement>
    </React.Fragment>
  );
});
