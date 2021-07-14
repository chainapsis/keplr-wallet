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
> = (prop) => {
  const style = useStyle();

  const propStyle = prop.style;
  delete prop.style;

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
          {...prop}
        />
        <View
          style={style.flatten(["absolute", "width-full", "height-full"])}
          pointerEvents="box-none"
        >
          {prop.fixed}
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};
