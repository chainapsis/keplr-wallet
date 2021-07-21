import React, { FunctionComponent } from "react";
import {
  SafeAreaView,
  SectionList,
  SectionListProps,
  StyleSheet,
  View,
} from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../svg";

export const PageWithSectionList: FunctionComponent<
  SectionListProps<any, any>
> = (props) => {
  const style = useStyle();

  const { style: propStyle, ...restProps } = props;

  return (
    <React.Fragment>
      <View style={style.get("absolute-fill")}>
        <GradientBackground />
      </View>
      <SafeAreaView style={style.get("flex-1")}>
        <SectionList
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
      </SafeAreaView>
    </React.Fragment>
  );
};
