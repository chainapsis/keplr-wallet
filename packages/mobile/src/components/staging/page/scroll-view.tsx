import React, { FunctionComponent } from "react";
import {
  SafeAreaView,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../svg";

export const PageWithScrollView: FunctionComponent<
  ScrollViewProps & {
    fixed?: React.ReactNode;
  }
> = (props) => {
  const style = useStyle();

  const { style: propStyle, fixed, ...restProps } = props;

  return (
    <React.Fragment>
      <View style={style.get("absolute-fill")}>
        <GradientBackground />
      </View>
      <SafeAreaView style={style.get("flex-1")}>
        <ScrollView
          style={StyleSheet.flatten([
            style.flatten([
              "flex-1",
              "padding-12",
              "padding-top-0",
              "overflow-visible",
            ]),
            propStyle,
          ])}
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
