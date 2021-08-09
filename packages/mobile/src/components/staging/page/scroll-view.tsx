import React, { FunctionComponent, useEffect } from "react";
import { SafeAreaView, ScrollViewProps, StyleSheet, View } from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { usePageScrollPosition } from "../../../providers/page-scroll-position";

export const PageWithScrollView: FunctionComponent<
  ScrollViewProps & {
    fixed?: React.ReactNode;
  }
> = (props) => {
  const style = useStyle();

  const pageScrollPosition = usePageScrollPosition();

  useEffect(() => {
    pageScrollPosition.setScrollY(0);

    return () => {
      pageScrollPosition.setScrollY(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { style: propStyle, fixed, ...restProps } = props;

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
        <KeyboardAwareScrollView
          style={StyleSheet.flatten([
            style.flatten(["flex-1", "padding-0", "overflow-visible"]),
            propStyle,
          ])}
          keyboardOpeningTime={0}
          onScroll={(e) => {
            pageScrollPosition.setScrollY(e.nativeEvent.contentOffset.y);
          }}
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
